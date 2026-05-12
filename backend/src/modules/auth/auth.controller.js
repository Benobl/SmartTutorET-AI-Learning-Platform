import { AuthService } from "./auth.service.js";
import { ApiError } from "../../middleware/error.middleware.js";
import logger from "../../config/logger.js";

const sanitizeUserForResponse = (userDoc) => {
    const payload = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete payload.password;
    delete payload.refreshTokens;
    delete payload.resetPasswordToken;
    delete payload.resetPasswordExpire;
    delete payload.verificationToken;
    return payload;
};

export class AuthController {
    static async signup(req, res, next) {
        try {
            const { user, accessToken, refreshToken } = await AuthService.signup(req.body);

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            };

            res.cookie("jwt", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
            res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
            res.cookie("user_role", user.role, { ...cookieOptions, httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

            res.status(201).json({
                success: true,
                message: "Registration successful. Please verify your email.",
                token: accessToken,
                data: sanitizeUserForResponse(user)
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            console.log(`[Auth Controller] Login POST received for: ${email}`);
            logger.info(`[Auth] Login attempt for: ${email}`);

            const user = await AuthService.login(email, password);
            console.log(`[Auth Controller] AuthService.login success for: ${user._id}`);
            logger.info(`[Auth] User found: ${user._id}`);

            const { accessToken, refreshToken } = AuthService.generateTokens(user._id);

            user.refreshTokens.push(refreshToken);
            await user.save();

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            };

            res.cookie("jwt", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
            res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
            res.cookie("user_role", user.role, { ...cookieOptions, httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

            res.status(200).json({ success: true, token: accessToken, data: sanitizeUserForResponse(user) });
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req, res, next) {
        try {
            console.log("[Auth Controller] Refresh Token Request Initiated");
            console.log("[Auth Controller] Cookies received:", req.cookies);
            const token = req.cookies.refreshToken;
            
            if (!token) {
                console.warn("[Auth Controller] Refresh token missing from cookies");
                throw new ApiError(401, "Refresh token missing");
            }

            const user = await AuthService.verifyRefreshToken(token);

            // Remove old token and issue new ones (rotation)
            user.refreshTokens = user.refreshTokens.filter(t => t !== token);
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = AuthService.generateTokens(user._id);

            user.refreshTokens.push(newRefreshToken);
            await user.save();

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            };

            res.cookie("jwt", newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
            res.cookie("refreshToken", newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
            res.cookie("user_role", user.role, { ...cookieOptions, httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

            console.log(`[Auth Controller] Refresh successful for user ${user._id}`);

            res.json({ 
                success: true, 
                message: "Token refreshed",
                token: newAccessToken,
                accessToken: newAccessToken
            });
        } catch (error) {
            next(error);
        }
    }

    static async googleLogin(req, res, next) {
        try {
            const { credential } = req.body;
            const user = await AuthService.googleLogin(credential);
            const { accessToken, refreshToken } = AuthService.generateTokens(user._id);

            user.refreshTokens.push(refreshToken);
            await user.save();

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                path: "/",
            };

            res.cookie("jwt", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
            res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
            res.cookie("user_role", user.role, { ...cookieOptions, httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });

            res.status(200).json({ success: true, token: accessToken, data: sanitizeUserForResponse(user) });
        } catch (error) {
            next(error);
        }
    }

    static logout(req, res) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        };
        res.clearCookie("jwt", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        res.clearCookie("user_role", { ...cookieOptions, httpOnly: false });
        res.status(200).json({ success: true, message: "Logout successful" });
    }

    static async verifyEmail(req, res, next) {
        try {
            await AuthService.verifyEmail(req.params.token);
            res.json({ success: true, message: "Email verified successfully" });
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req, res, next) {
        try {
            await AuthService.forgotPassword(req.body.email);
            res.json({ success: true, message: "Password reset email sent" });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req, res, next) {
        try {
            await AuthService.resetPassword(req.params.token, req.body.password);
            res.json({ success: true, message: "Password reset successful" });
        } catch (error) {
            next(error);
        }
    }

    static async getMe(req, res) {
        res.status(200).json({ success: true, data: req.user });
    }

    static async getStreamToken(req, res, next) {
        try {
            const { generateStreamToken } = await import("../../lib/stream.js");
            const token = generateStreamToken(req.user._id);
            res.status(200).json({ success: true, token });
        } catch (error) {
            next(error);
        }
    }
}
