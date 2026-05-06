import express from "express";
import { InviteController } from "./invite.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/mine", verifyToken, InviteController.getMine);
router.post("/", verifyToken, InviteController.send);
router.post("/respond", verifyToken, InviteController.respond);

export default router;
