import express from "express";
import { ChatController } from "./chat.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/squad/:squadId", ChatController.getSquadHistory);
router.get("/direct/:otherUserId", ChatController.getDirectHistory);
router.post("/mark-seen", ChatController.markSeen);

export default router;
