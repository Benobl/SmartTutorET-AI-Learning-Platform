import { ApiError } from "./error.middleware.js";

/**
 * Custom CSRF protection middleware.
 * Checks for a custom header to ensure the request is coming from our trusted frontend.
 */
export const csrfProtection = (req, res, next) => {
    const sensitiveMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (sensitiveMethods.includes(req.method)) {
        const csrfHeader = req.headers["x-requested-with"] || req.headers["x-st-csrf"];

        // In a production environment, you might verify this against a token stored in a cookie.
        // For now, ensuring the header exists is a strong first layer against blind CSRF.
        if (!csrfHeader) {
            return next(new ApiError(403, "CSRF validation failed: Missing custom header"));
        }
    }

    next();
};
