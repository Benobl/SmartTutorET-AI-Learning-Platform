import { ApiError } from "./error.middleware.js";

/**
 * RBAC middleware to authorize users based on roles.
 * @param {...string} allowedRoles - List of roles permitted to access the route.
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Authentication required"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(403, `Access denied. Roles allowed: ${allowedRoles.join(", ")}`)
            );
        }

        next();
    };
};
