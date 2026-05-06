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
router.get("/search", UserController.searchByEmail);

export default router;
