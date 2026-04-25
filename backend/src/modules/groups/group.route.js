import express from "express";
import { GroupController } from "./group.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, GroupController.create);
router.post("/:groupId/join", protectRoute, GroupController.join);
router.get("/:groupId/forums", protectRoute, GroupController.getForums);
router.post("/forums/:forumId/threads", protectRoute, GroupController.createThread);
router.get("/forums/:forumId/threads", protectRoute, GroupController.getThreads);

export default router;
