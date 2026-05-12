import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { ApiError } from "./error.middleware.js";

export const verifyToken = async (req, res, next) => {
    try {
        let token = req.cookies?.jwt;
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new Error("NO_TOKEN");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            throw new Error("INVALID_DECODED_TOKEN");
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }

        req.user = user;
        next();
    } catch (error) {
        // Detailed log only for server
        console.error("[Auth Middleware] Token verification failed:", error.message);
        // Generic error for client
        next(new ApiError(401, "Email or password is incorrect"));
    }
}

export const protectRoute = verifyToken;

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Authentication required"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `FORBIDDEN: Access denied for role '${req.user.role}'`));
        }
        next();
    };
};

export const allowRoles = authorizeRoles;

