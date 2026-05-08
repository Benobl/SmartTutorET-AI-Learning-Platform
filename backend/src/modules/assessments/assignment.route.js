import express from "express";
import { AssignmentController } from "./assignment.controller.js";
import { verifyToken, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Common: Get assignments for a course
router.get("/course/:subjectId", verifyToken, AssignmentController.getAssignmentsBySubject);

// Tutor Routes
router.post("/", verifyToken, authorizeRoles("tutor", "admin"), AssignmentController.createAssignment);
router.get("/:assignmentId/submissions", verifyToken, authorizeRoles("tutor", "admin"), AssignmentController.getAssignmentSubmissions);
router.post("/submission/:submissionId/evaluate", verifyToken, authorizeRoles("tutor", "admin"), AssignmentController.evaluateSubmission);

// Student Routes
router.post("/:assignmentId/submit", verifyToken, authorizeRoles("student"), AssignmentController.submitAssignment);
router.get("/my-marks", verifyToken, authorizeRoles("student"), AssignmentController.getMyMarks);
router.get("/course/:subjectId/my-submissions", verifyToken, authorizeRoles("student"), AssignmentController.getMySubmissionsForSubject);

export default router;
