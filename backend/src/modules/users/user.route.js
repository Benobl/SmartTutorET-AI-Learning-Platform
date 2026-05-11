import express from "express";
import { UserController } from "./user.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/onboarding", verifyToken, UserController.onboard);
router.get("/profile/:userId", verifyToken, UserController.getProfile);
router.patch("/profile", verifyToken, UserController.updateProfile);
router.post("/friend-request", verifyToken, UserController.sendFriendRequest);
router.get("/students", verifyToken, UserController.getStudents);
router.get("/tutors", verifyToken, UserController.getTutors);
router.get("/search", verifyToken, UserController.searchByEmail);
router.get("/stats", verifyToken, UserController.getStudentStats);
router.get("/tutor-stats", verifyToken, UserController.getTutorStats);
router.get("/leaderboard", verifyToken, UserController.getLeaderboard);
router.patch("/change-password", verifyToken, UserController.changePassword);
router.post("/admin-reset-password", verifyToken, (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
    }
    next();
}, UserController.adminResetPassword);

export default router;
