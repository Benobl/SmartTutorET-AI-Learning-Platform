import { AuthService } from "./auth.service.js";
import logger from "../../config/logger.js";

export class AuthController {
    static async signup(req, res, next) {
        try {
            const user = await AuthService.signup(req.body);
            const { accessToken, refreshToken } = AuthService.generateTokens(user._id);

            user.refreshTokens.push(refreshToken);
            await user.save();

            res.cookie("jwt", accessToken, {
                maxAge: 15 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("refreshToken", refreshToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("user_role", user.role, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: false,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.status(201).json({
                success: true,
                message: "Registration successful. Please verify your email.",
                data: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await AuthService.login(email, password);
            const { accessToken, refreshToken } = AuthService.generateTokens(user._id);

            user.refreshTokens.push(refreshToken);
            await user.save();

            res.cookie("jwt", accessToken, {
                maxAge: 15 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("refreshToken", refreshToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("user_role", user.role, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: false,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req, res, next) {
        try {
            const token = req.cookies.refreshToken;
            if (!token) throw new ApiError(401, "Refresh token missing");

            const user = await AuthService.verifyRefreshToken(token);

            // Remove old token and issue new ones (rotation)
            user.refreshTokens = user.refreshTokens.filter(t => t !== token);
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = AuthService.generateTokens(user._id);

            user.refreshTokens.push(newRefreshToken);
            await user.save();

            res.cookie("jwt", newAccessToken, {
                maxAge: 15 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("refreshToken", newRefreshToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("user_role", user.role, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: false, // Middleware needs to read this
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.json({ success: true, message: "Token refreshed" });
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

            res.cookie("jwt", accessToken, {
                maxAge: 15 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("refreshToken", refreshToken, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.cookie("user_role", user.role, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: false,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
            });

            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    static logout(req, res) {
        res.clearCookie("jwt");
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
