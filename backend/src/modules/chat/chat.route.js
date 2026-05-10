import express from "express";
import { ChatController } from "./chat.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/squad/:squadId", ChatController.getSquadHistory);
router.get("/direct/:otherUserId", ChatController.getDirectHistory);
router.get("/conversations", ChatController.getConversations);
router.post("/mark-seen", ChatController.markSeen);

export default router;
