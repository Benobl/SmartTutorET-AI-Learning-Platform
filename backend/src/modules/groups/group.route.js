import express from "express";
import { GroupController } from "./group.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, GroupController.getAll);
router.get("/mine", protectRoute, GroupController.getMyGroups);
router.post("/", protectRoute, GroupController.create);
router.post("/join/:groupId", protectRoute, GroupController.join);
router.get("/:groupId/forums", protectRoute, GroupController.getForums);
router.post("/forums/:forumId/threads", protectRoute, GroupController.createThread);
router.get("/forums/:forumId/threads", protectRoute, GroupController.getThreads);

export default router;
