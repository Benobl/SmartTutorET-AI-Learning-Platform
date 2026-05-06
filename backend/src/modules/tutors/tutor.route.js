import express from "express";
import { TutorController } from "./tutor.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/jobs", TutorController.getJobs);
router.post("/apply/:jobId", verifyToken, TutorController.applyTutor);

export default router;
