import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createLiveSession, joinLiveSession, endLiveSession } from "../controllers/liveSession.controller.js";

const router = express.Router();

router.post("/", protectRoute, createLiveSession);
router.post("/join/:sessionId", protectRoute, joinLiveSession);
router.post("/end/:sessionId", protectRoute, endLiveSession);

export default router;
