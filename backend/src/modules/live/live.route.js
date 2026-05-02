import express from "express";
import { LiveController } from "./live.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/active", protectRoute, LiveController.getActive);
router.post("/", protectRoute, LiveController.create);
router.post("/join/:sessionId", protectRoute, LiveController.join);
router.post("/end/:sessionId", protectRoute, LiveController.end);

export default router;
