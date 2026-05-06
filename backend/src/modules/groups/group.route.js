import express from "express";
import { GroupController } from "./group.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, GroupController.getAll);
router.get("/mine", verifyToken, GroupController.getMyGroups);
router.post("/", verifyToken, GroupController.create);
router.post("/join/:groupId", verifyToken, GroupController.join);
router.get("/:groupId/forums", verifyToken, GroupController.getForums);
router.post("/forums/:forumId/threads", verifyToken, GroupController.createThread);
router.get("/forums/:forumId/threads", verifyToken, GroupController.getThreads);
router.post("/:groupId/toggle-live", verifyToken, GroupController.toggleLive);

export default router;
