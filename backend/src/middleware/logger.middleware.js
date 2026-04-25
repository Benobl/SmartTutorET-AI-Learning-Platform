import logger from "../config/logger.js";

export const requestLogger = (req, res, next) => {
    logger.info(`📨 ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0 && process.env.NODE_ENV !== "production") {
        logger.debug("📦 Body:", req.body);
    }
    next();
};
