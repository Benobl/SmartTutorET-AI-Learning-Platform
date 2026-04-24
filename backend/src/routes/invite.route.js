import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendInvite, respondToInvite, getMyInvites } from "../controllers/invite.controller.js";

const router = express.Router();

router.post("/", protectRoute, sendInvite);
router.post("/respond", protectRoute, respondToInvite);
router.get("/mine", protectRoute, getMyInvites);

export default router;
