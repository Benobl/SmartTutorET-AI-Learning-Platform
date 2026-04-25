import express from "express";
import { AIController } from "./ai.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { generateResponseSchema } from "./ai.validation.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many AI requests, please try again later"
});

router.post("/tutor", protectRoute, aiLimiter, validate(generateResponseSchema), AIController.generateResponse);

export default router;
