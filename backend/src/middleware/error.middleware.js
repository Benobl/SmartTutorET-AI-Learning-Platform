import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
    // 1. Server-side detailed logging (NOT sent to client)
    logger.error(`[${req.method}] ${req.path} >> ${err.message}`, {
        stack: err.stack,
        details: err.errors
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // 2. High-Security Masking for Authentication Failures
    const isAuthRoute = req.path.includes("/auth/") || req.path.includes("/login") || req.path.includes("/signup");
    
    if (isAuthRoute) {
        // Standardized security response
        statusCode = statusCode === 500 ? 401 : statusCode;
        
        // Specific user-facing messages based on context, but still generic enough
        if (req.path.includes("/login") || req.path.includes("/signup")) {
            message = "Invalid email or password";
        } else if (req.path.includes("/reset-password") || req.path.includes("/verify-email")) {
            message = statusCode === 400 ? message : "Unable to process request. Please try again.";
        } else {
            // Log the REAL error for debugging
            logger.error(`[AUTH-FAILURE] ${err.name}: ${err.message}`, { stack: err.stack });
            message = "Authentication failed";
        }
    } else {
        // Handle Mongoose Validation Error for non-auth routes
        if (err.name === "ValidationError") {
            statusCode = 400;
            message = Object.values(err.errors).map(val => val.message).join(", ");
        }

        // Handle Mongoose Cast Error for non-auth routes
        if (err.name === "CastError") {
            statusCode = 400;
            message = `Invalid ${err.path}: ${err.value}`;
        }
    }

    // 3. Clean client response
    res.status(statusCode).json({
        success: false,
        message: message
    });
};

export class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
