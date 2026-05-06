import express from "express";
import { LiveController } from "./live.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/active", verifyToken, LiveController.getActive);
router.post("/", verifyToken, LiveController.create);
router.post("/join/:sessionId", verifyToken, LiveController.join);
router.post("/end/:sessionId", verifyToken, LiveController.end);

export default router;
