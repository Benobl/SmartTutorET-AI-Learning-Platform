import { ApiError } from "./error.middleware.js";

/**
 * Generic validation middleware for Zod schemas
 * @param {import("zod").ZodSchema} schema 
 */
export const validate = (schema) => (req, res, next) => {
    try {
        const data = {
            body: req.body,
            query: req.query,
            params: req.params,
        };

        schema.parse(data);
        next();
    } catch (error) {
        // High-Security Masking for Auth Routes
        const isAuthRoute = req.path.includes("/auth/") || req.path.includes("/login") || req.path.includes("/signup");
        
        if (isAuthRoute) {
            return next(new ApiError(401, "Invalid request"));
        }

        const formattedErrors = error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
        }));

        next(new ApiError(400, "Validation Failed", formattedErrors));
    }
};
