import express from "express";
import { AIController } from "./ai.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { generateResponseSchema } from "./ai.validation.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many AI requests, please try again later"
});

const publicAiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Public AI usage limit reached. Please sign in for more access."
});

router.post("/ask-tutor", verifyToken, aiLimiter, AIController.askTutor);
router.post("/audit-security", verifyToken, aiLimiter, AIController.auditSecurity);
router.get("/history", verifyToken, AIController.getChatHistory);
router.post("/tutor-response", verifyToken, aiLimiter, validate(generateResponseSchema), AIController.generateResponse);
router.post("/course-outline", verifyToken, AIController.getCourseOutline);
router.post("/resource-suggestions", verifyToken, AIController.getSuggestions);
router.post("/generate-grade-curriculum", verifyToken, AIController.generateGradeCurriculum);
router.post("/generate-grade-schedule", verifyToken, AIController.generateGradeSchedule);
router.post("/generate-study-plan", verifyToken, AIController.generateStudyPlan);
router.post("/performance-insights", verifyToken, AIController.getPerformanceInsights);

// Public Routes
router.post("/public-tutor-response", publicAiLimiter, validate(generateResponseSchema), AIController.generatePublicResponse);

export default router;
