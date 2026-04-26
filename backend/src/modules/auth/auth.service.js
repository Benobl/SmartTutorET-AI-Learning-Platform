import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../users/user.model.js";
import { upsertStreamUser } from "../../lib/stream.js";
import { sendEmail, sendPasswordResetEmail } from "../../lib/email.service.js";
import { ApiError } from "../../middleware/error.middleware.js";
import logger from "../../config/logger.js";

export class AuthService {
    static async signup(userData) {
        const { email, password, fullName, role } = userData;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new ApiError(400, "Email already registered");
        }

        const validRoles = ["student", "tutor", "manager"];
        const userRole = (role && validRoles.includes(role)) ? role : "student";
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const idx = Math.floor(Math.random() * 100) + 1;
        const profilePic = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            ...userData,
            email: email.toLowerCase(),
            role: userRole,
            profilePic,
            verificationToken,
            tutorStatus: userRole === "tutor" ? "pending" : "none"
        });

        // Stream & Email integration (async)
        upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || "",
        }).catch(err => console.error("Stream sync error:", err));

        sendEmail(newUser.email, verificationToken).catch(err => console.error("Email send error:", err));

        return newUser;
    }

    static async login(email, password) {
        logger.info(`[AuthService] Attempting login for ${email}`);
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            logger.warn(`[AuthService] User not found: ${email}`);
            throw new ApiError(401, "Invalid credentials");
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            logger.warn(`[AuthService] Password mismatch for ${email}`);
            throw new ApiError(401, "Invalid credentials");
        }

        logger.info(`[AuthService] Login successful for ${email}`);
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
                    firstName: given_name,
                    lastName: family_name,
                    fullName: `${given_name} ${family_name}`,
                    role: "student", // Default role for Google signup
                    profilePic: picture,
                    isVerified: true, // Google accounts are pre-verified
                    googleId: sub,
                    tutorStatus: "none"
                });

                upsertStreamUser({
                    id: user._id.toString(),
                    name: user.fullName,
                    image: user.profilePic || "",
                }).catch(err => console.error("Stream sync error:", err));
            }

            return user;
        } catch (error) {
            const msg = error?.message || "Unknown error";
            console.error("[Google Auth Error]", msg);
            throw new ApiError(401, `Google authentication failed: ${msg}`);
        }
    }
}
