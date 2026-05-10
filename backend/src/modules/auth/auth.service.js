import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import mongoose from "mongoose";
import User from "../users/user.model.js";
import { upsertStreamUser } from "../../lib/stream.js";
import { sendEmail, sendPasswordResetEmail } from "../../lib/email.service.js";
import { ApiError } from "../../middleware/error.middleware.js";
import logger from "../../config/logger.js";

export class AuthService {
    static async signup(userData) {
        const { email, password, name, role } = userData;
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new ApiError(400, "Email already registered");
        }

        const validRoles = ["student", "tutor", "manager", "admin"];
        const userRole = (role && validRoles.includes(role)) ? role : "student";
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const idx = Math.floor(Math.random() * 100) + 1;
        const defaultAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            ...userData,
            email: normalizedEmail,
            role: userRole,
            isApproved: userRole !== "tutor", // Tutor is false, others are true
            isVerified: userRole !== "tutor", // Auto-verify non-tutors for now to ease login
            profile: {
                avatar: userData.avatar || defaultAvatar,
                bio: userData.bio || "",
                expertise: userData.expertise || [],
                education: userData.education || "",
            },
            verificationToken,
            tutorStatus: userRole === "tutor" ? "pending" : "none"
        });

        const { accessToken, refreshToken } = this.generateTokens(newUser._id);
        newUser.refreshTokens.push(refreshToken);
        await newUser.save();

        // Stream & Email integration (async)
        upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.name,
            image: newUser.profile.avatar || "",
        }).catch(err => logger.error("Stream sync error:", err));

        if (userRole === "tutor") {
            sendEmail(newUser.email, verificationToken).catch(err => logger.error("Email send error:", err));
        }

        return { user: newUser, accessToken, refreshToken };
    }

    static async login(email, password) {
        if (mongoose.connection.readyState !== 1) {
            throw new ApiError(503, "Database is temporarily unavailable. Please try again shortly.");
        }
        const normalizedEmail = email.trim().toLowerCase();
        logger.info(`[AuthService] Attempting login for ${normalizedEmail}`);
        
        const user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            logger.warn(`[AuthService] User not found: ${normalizedEmail}`);
            throw new ApiError(401, "Invalid email or password");
        }

        if (!user.password) {
            logger.warn(`[AuthService] User has no password (likely Google Auth): ${normalizedEmail}`);
            throw new ApiError(401, "Please use Google Login for this account");
        }

        const isMatch = await user.matchPassword(password);
        console.log(`[AUTH-DEBUG] Email: "${normalizedEmail}" | Input Pass Length: ${password.length} | Match: ${isMatch}`);
        
        if (!isMatch) {
            logger.warn(`[AuthService] Password mismatch for ${normalizedEmail}`);
            throw new ApiError(401, "Invalid email or password");
        }

        // Check approval status
        if (!user.isApproved) {
            if (user.role === "tutor") {
                if (user.tutorStatus === "rejected") {
                    logger.warn(`[AuthService] Rejected tutor login attempt: ${email}`);
                    throw new ApiError(403, "Your tutor application has been rejected. Please contact support for further information.");
                }
                logger.warn(`[AuthService] Pending tutor login attempt: ${email}`);
                throw new ApiError(403, "Your tutor account is pending approval by a manager. You will receive an email once reviewed.");
            }
            throw new ApiError(403, "Your account is not approved.");
        }

        logger.info(`[AuthService] Login successful for ${email}`);

        // Sync with Stream (async)
        upsertStreamUser({
            id: user._id.toString(),
            name: user.name,
            image: user.profile.avatar || "",
        }).catch(err => logger.error("Stream sync error (login):", err));

        return user;
    }

    static generateTokens(userId) {
        const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || "refresh_secret", { expiresIn: "7d" });
        return { accessToken, refreshToken };
    }

    static async verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");
            const user = await User.findById(decoded.userId);

            if (!user || !user.refreshTokens.includes(token)) {
                throw new ApiError(401, "Invalid refresh token");
            }

            return user;
        } catch (error) {
            throw new ApiError(401, "Invalid refresh token");
        }
    }

    static async verifyEmail(token) {
        const user = await User.findOne({ verificationToken: token });
        if (!user) throw new ApiError(400, "Invalid or expired token");

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        return user;
    }

    static async forgotPassword(email) {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) throw new ApiError(404, "User not found");

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        sendPasswordResetEmail(user.email, token).catch(err => console.error("Reset email error:", err));
        return token;
    }

    static async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) throw new ApiError(400, "Invalid or expired token");

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return user;
    }

    static async googleLogin(credential) {
        logger.info("[AuthService] Starting Google Login verification");
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        try {
            logger.info("[AuthService] Verifying token with Google...");
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const { email, given_name, family_name, picture, sub } = payload;
            logger.info(`[AuthService] Google token verified for ${email}`);

            let user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                user = await User.create({
                    email: email.toLowerCase(),
                    name: `${given_name} ${family_name}`,
                    role: "student", // Default role for Google signup
                    profile: {
                        avatar: picture,
                    },
                    isVerified: true, // Google accounts are pre-verified
                    googleId: sub,
                    tutorStatus: "none"
                });
            }

            // Sync with Stream (async) for both new and existing users
            upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profile.avatar || "",
            }).catch(err => logger.error("Stream sync error (google login):", err));

            return user;
        } catch (error) {
            const msg = error?.message || "Unknown error";
            console.error("[Google Auth Error]", msg);
            throw new ApiError(401, `Google authentication failed: ${msg}`);
        }
    }
}
