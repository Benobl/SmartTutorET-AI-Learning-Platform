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

router.post("/tutor-response", verifyToken, aiLimiter, validate(generateResponseSchema), AIController.generateResponse);
router.post("/course-outline", verifyToken, AIController.getCourseOutline);
router.post("/resource-suggestions", verifyToken, AIController.getSuggestions);
router.post("/generate-grade-curriculum", verifyToken, AIController.generateGradeCurriculum);
router.post("/generate-grade-schedule", verifyToken, AIController.generateGradeSchedule);
router.post("/generate-study-plan", verifyToken, AIController.generateStudyPlan);

export default router;
