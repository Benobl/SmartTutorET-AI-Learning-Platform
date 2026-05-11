import express from "express";
import { AdminController } from "./admin.controller.js";
import { verifyToken, allowRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/pending-tutors", allowRoles("manager", "admin"), AdminController.getPending);
router.get("/stats", allowRoles("manager", "admin"), AdminController.getStats);
router.get("/jobs", allowRoles("manager", "admin"), AdminController.getJobs);
router.post("/jobs", allowRoles("manager", "admin"), AdminController.createJob);
router.delete("/jobs/:id", allowRoles("manager", "admin"), AdminController.deleteJob);
router.patch("/approve-tutor/:userId", allowRoles("manager", "admin"), AdminController.approve);
router.patch("/reject-tutor/:userId", allowRoles("manager", "admin"), AdminController.reject);

// --- Subject Approval ---
router.get("/pending-subjects", allowRoles("manager", "admin"), AdminController.getPendingSubjects);
router.patch("/approve-subject/:id", allowRoles("manager", "admin"), AdminController.approveSubject);
router.patch("/reject-subject/:id", allowRoles("manager", "admin"), AdminController.rejectSubject);

// --- Monitoring ---
router.get("/users", allowRoles("manager", "admin"), AdminController.getUsers);
router.get("/student-progress/:studentId", allowRoles("manager", "admin"), AdminController.getProgress);

// --- Module Management ---
router.get("/payments", allowRoles("admin"), AdminController.getPayments);
router.get("/live-sessions", allowRoles("admin", "manager"), AdminController.getLiveSessions);
router.get("/assessments", allowRoles("admin", "manager"), AdminController.getAssessments);
router.get("/forums", allowRoles("admin", "manager"), AdminController.getForums);
router.get("/analytics", allowRoles("admin", "manager"), AdminController.getAnalytics);
router.delete("/users/:userId", allowRoles("admin"), AdminController.deleteUser);
router.post("/appoint-manager", allowRoles("admin"), AdminController.appointManager);
router.patch("/users/:userId", allowRoles("admin", "manager"), AdminController.updateUser);
router.patch("/users/:userId/status", allowRoles("admin", "manager"), AdminController.updateUserStatus);
router.patch("/users/:userId/reset-password", allowRoles("admin", "manager"), AdminController.resetPassword);
router.get("/settings", allowRoles("admin"), AdminController.getSettings);
router.patch("/settings", allowRoles("admin"), AdminController.updateSettings);
router.get("/health", allowRoles("admin", "manager"), AdminController.getHealth);
router.get("/flags", allowRoles("admin", "manager"), AdminController.getFlags);
router.patch("/flags/:id/resolve", allowRoles("admin", "manager"), AdminController.resolveFlag);

export default router;
