import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import mongoose from "mongoose";
import User from "../users/user.model.js";
import { upsertStreamUser } from "../../lib/stream.js";
import { sendEmail, sendPasswordResetEmail } from "../../lib/email.service.js";
import { ApiError } from "../../middleware/error.middleware.js";
import logger from "../../config/logger.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

export class AuthService {
    static async signup(userData) {
        const { email, password, name, role } = userData;
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            // High security masking
            throw new ApiError(401, "Invalid credentials");
        }

        const validRoles = ["student", "tutor", "manager", "admin"];
        const userRole = (role && validRoles.includes(role)) ? role : "student";
        
        // Generate secure verification token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        const idx = Math.floor(Math.random() * 100) + 1;
        const defaultAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = new User({
            ...userData,
            email: normalizedEmail,
            role: userRole,
            isApproved: userRole !== "tutor",
            isVerified: userRole !== "tutor",
            profile: {
                avatar: userData.avatar || defaultAvatar,
                bio: userData.bio || "",
                expertise: userData.expertise || [],
                education: userData.education || "",
            },
            verificationToken: hashedToken,
            tutorStatus: userRole === "tutor" ? "pending" : "none"
        });

        newUser.password = password;
        await newUser.save();

        const { accessToken, refreshToken } = this.generateTokens(newUser._id);
        newUser.refreshTokens = [refreshToken];
        await newUser.save();

        // Stream sync (async)
        upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.name,
            image: newUser.profile.avatar || "",
        }).catch(err => logger.error("Stream sync error:", err));

        if (userRole === "tutor") {
            // Send email with RAW token
            sendEmail(newUser.email, rawToken).catch(err => logger.error("Email send error:", err));
        }

        return { user: newUser, accessToken, refreshToken };
    }

    static async login(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        logger.info(`[Auth-Debug] Login attempt for: ${normalizedEmail}`);
        
        const user = await User.findOne({ email: normalizedEmail }).select("+password +loginAttempts +lockUntil");

        if (!user) {
            logger.warn(`[Auth-Debug] User not found: ${normalizedEmail}`);
            throw new ApiError(401, "Invalid credentials");
        }

        logger.info(`[Auth-Debug] User found. Attempts: ${user.loginAttempts}, Locked: ${user.lockUntil ? new Date(user.lockUntil).toISOString() : 'no'}`);

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            logger.error(`[Auth-Debug] Account LOCKED for: ${normalizedEmail}`);
            throw new ApiError(401, "Account temporarily locked. Please try again later.");
        }

        const isMatch = await user.matchPassword(password);
        logger.info(`[Auth-Debug] Password match result: ${isMatch}`);

        if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockUntil = Date.now() + LOCK_TIME;
                logger.error(`[Auth-Debug] LOCKING account now: ${normalizedEmail}`);
            }
            await user.save();
            throw new ApiError(401, "Invalid credentials");
        }

        // Reset attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        
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
                // Potential reuse attack - invalidate all sessions for safety
                if (user) {
                    logger.warn(`[Auth] Refresh token reuse detected for user ${user._id}. Invalidating all sessions.`);
                    user.refreshTokens = [];
                    await user.save();
                }
                throw new ApiError(401, "Invalid session");
            }

            return user;
        } catch (error) {
            throw new ApiError(401, "Invalid session");
        }
    }

    static async verifyEmail(rawToken) {
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const user = await User.findOne({ verificationToken: hashedToken });
        
        if (!user) {
            logger.warn(`[Auth] Invalid email verification attempt with token: ${rawToken}`);
            throw new ApiError(400, "Invalid or expired verification link");
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        return user;
    }

    static async forgotPassword(email) {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        // Always return success to prevent enumeration
        if (!user) return true;

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 Hour
        await user.save();

        // Send RAW token to user
        sendPasswordResetEmail(user.email, rawToken).catch(err => logger.error("Reset email error:", err));
        return true;
    }

    static async resetPassword(rawToken, newPassword) {
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            logger.warn(`[Auth] Invalid or expired password reset attempt.`);
            throw new ApiError(400, "Invalid or expired reset link");
        }

        // Set new password (will be hashed by pre-save hook)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        
        logger.info(`[Auth] Password reset SUCCESS for: ${user.email}`);
        console.log(`[Auth-Debug] Password reset SUCCESS for: ${user.email}`);
        
        // Invalidate all existing sessions on password change
        user.refreshTokens = [];
        
        await user.save();
        return user;
    }

    static async googleLogin(credential) {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const { email, given_name, family_name, picture, sub } = payload;

            let user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                user = await User.create({
                    email: email.toLowerCase(),
                    name: `${given_name} ${family_name}`,
                    role: "student",
                    profile: { avatar: picture },
                    isVerified: true,
                    googleId: sub,
                    tutorStatus: "none"
                });
            } else if (!user.googleId) {
                // Link Google account to existing email if it wasn't already
                user.googleId = sub;
                user.isVerified = true;
                await user.save();
            }

            upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profile.avatar || "",
            }).catch(err => logger.error("Stream sync error (google login):", err));

            return user;
        } catch (error) {
            logger.error(`[Auth] Google Login verification failure: ${error.message}`);
            throw new ApiError(401, "Google authentication failed");
        }
    }

    static async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId).select("+password");
        if (!user) throw new ApiError(401, "Invalid request");

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) throw new ApiError(401, "Old password is incorrect");

        user.password = newPassword;
        user.refreshTokens = []; // Logout other sessions
        await user.save();
        return true;
    }

    static async adminResetPassword(userId, newPassword) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        user.password = newPassword;
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.refreshTokens = []; // Logout sessions
        await user.save();
        return true;
    }
}
