import express from "express";
import { AssessmentController } from "./assessment.controller.js";
import { verifyToken, allowRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", allowRoles("tutor", "admin", "manager"), AssessmentController.create);
router.post("/generate-ai", allowRoles("tutor", "student", "admin", "manager"), AssessmentController.generateAI);
router.get("/", AssessmentController.getAll);
router.get("/submissions", AssessmentController.getSubmissions);
router.get("/:id", AssessmentController.getById);
router.patch("/:id/publish", allowRoles("tutor", "admin", "manager"), AssessmentController.publish);
router.delete("/:id", allowRoles("tutor", "admin", "manager"), AssessmentController.delete);
router.post("/:id/start", allowRoles("student"), AssessmentController.start);
router.post("/:id/submit", allowRoles("student"), AssessmentController.submit);

export default router;
