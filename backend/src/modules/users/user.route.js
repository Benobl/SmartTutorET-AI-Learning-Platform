import express from "express";
import { UserController } from "./user.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/onboarding", protectRoute, UserController.onboard);
router.get("/profile/:userId", protectRoute, UserController.getProfile);
router.patch("/profile", protectRoute, UserController.updateProfile);
router.post("/friend-request", protectRoute, UserController.sendFriendRequest);

export default router;
