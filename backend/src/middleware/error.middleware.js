import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
    console.error("DEBUG: Error Handler Triggered", {
        name: err.name,
        message: err.message,
        status: err.statusCode,
        stack: err.stack
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(", ");
    }

    // Handle Mongoose Cast Error (e.g., invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    logger.error(`[${req.method}] ${req.path} >> ${message}`);

    // Ensure we ALWAYS return a JSON object with at least a message
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: message || "An unexpected error occurred",
        errors: err.errors || null,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
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
