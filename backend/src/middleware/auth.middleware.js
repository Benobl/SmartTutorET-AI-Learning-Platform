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
            return next(new ApiError(401, "Authentication required: No token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return next(new ApiError(401, "Authentication failed: Invalid token"));
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return next(new ApiError(401, "User no longer exists in database"));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in verifyToken middleware:", error.name, error.message);
        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Authentication failed: Token expired"));
        }
        if (error.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Authentication failed: Malformed token"));
        }
        next(error);
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

