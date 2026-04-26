import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error(`[${req.method}] ${req.path} >> ${message}`, {
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
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
