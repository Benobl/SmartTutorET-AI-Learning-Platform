import express from "express";
import { LiveController } from "./live.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { uploadVideo } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.get("/active", verifyToken, LiveController.getActive);
router.get("/recordings", verifyToken, LiveController.getRecordings);
router.post("/", verifyToken, LiveController.create);
router.post("/join/:sessionId", verifyToken, LiveController.join);
router.post("/end/:sessionId", verifyToken, LiveController.end);
router.post("/upload-recording", verifyToken, uploadVideo.single("video"), LiveController.uploadRecording);

export default router;
