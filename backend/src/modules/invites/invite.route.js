import express from "express";
import { InviteController } from "./invite.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/mine", protectRoute, InviteController.getMine);
router.post("/", protectRoute, InviteController.send);
router.post("/respond", protectRoute, InviteController.respond);

export default router;
