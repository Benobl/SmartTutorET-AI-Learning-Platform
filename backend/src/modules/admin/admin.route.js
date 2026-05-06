import express from "express";
import { AdminController } from "./admin.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/pending-tutors", allowRoles("manager"), AdminController.getPending);
router.get("/stats", allowRoles("manager", "admin"), AdminController.getStats);
router.get("/jobs", allowRoles("manager", "admin"), AdminController.getJobs);
router.post("/jobs", allowRoles("manager", "admin"), AdminController.createJob);
router.delete("/jobs/:id", allowRoles("manager", "admin"), AdminController.deleteJob);
router.patch("/approve-tutor/:userId", allowRoles("manager"), AdminController.approve);
router.patch("/reject-tutor/:userId", allowRoles("manager"), AdminController.reject);

// --- Subject Approval ---
router.get("/pending-subjects", allowRoles("manager"), AdminController.getPendingSubjects);
router.patch("/approve-subject/:id", allowRoles("manager"), AdminController.approveSubject);
router.patch("/reject-subject/:id", allowRoles("manager"), AdminController.rejectSubject);

// --- Monitoring ---
router.get("/users", allowRoles("manager"), AdminController.getUsers);
router.get("/student-progress/:studentId", allowRoles("manager"), AdminController.getProgress);

export default router;
