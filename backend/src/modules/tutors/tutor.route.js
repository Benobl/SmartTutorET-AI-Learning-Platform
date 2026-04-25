import express from "express";
import { TutorController } from "./tutor.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/jobs", TutorController.getJobs);
router.post("/apply/:jobId", protectRoute, TutorController.applyTutor);

export default router;
