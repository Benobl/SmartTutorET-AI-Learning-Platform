import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createForum,
    createThread,
    getThreadsByForum,
    createPost,
    getPostsByThread,
} from "../controllers/forum.controller.js";

const router = express.Router();

router.post("/", protectRoute, createForum);
router.post("/threads", protectRoute, createThread);
router.get("/threads/:forumId", protectRoute, getThreadsByForum);
router.post("/posts", protectRoute, createPost);
router.get("/posts/:threadId", protectRoute, getPostsByThread);

export default router;
