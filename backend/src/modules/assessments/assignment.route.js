import express from "express";
import { AssignmentController } from "./assignment.controller.js";
import { verifyToken, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Common: Get assignments for a course
router.get("/course/:subjectId", verifyToken, AssignmentController.getAssignmentsBySubject);

// Tutor Routes
router.post("/", verifyToken, authorizeRoles("tutor", "admin", "manager"), AssignmentController.createAssignment);
router.get("/:assignmentId/submissions", verifyToken, authorizeRoles("tutor", "admin", "manager"), AssignmentController.getAssignmentSubmissions);
router.post("/submission/:submissionId/evaluate", verifyToken, authorizeRoles("tutor", "admin", "manager"), AssignmentController.evaluateSubmission);

// Student Routes
router.post("/:assignmentId/submit", verifyToken, authorizeRoles("student"), AssignmentController.submitAssignment);
router.get("/my-marks", verifyToken, authorizeRoles("student"), AssignmentController.getMyMarks);
router.get("/course/:subjectId/my-submissions", verifyToken, authorizeRoles("student"), AssignmentController.getMySubmissionsForSubject);
router.get("/leaderboard", verifyToken, AssignmentController.getLeaderboard);
router.get("/my-grades", verifyToken, authorizeRoles("student"), AssignmentController.getStudentGrades);

export default router;
