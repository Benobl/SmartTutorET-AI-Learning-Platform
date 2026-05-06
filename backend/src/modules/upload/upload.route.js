import express from "express";
import { upload } from "../../middleware/upload.middleware.js";
import { UploadController } from "./upload.controller.js";

const router = express.Router();

// POST /api/upload/document — Upload a single document (PDF, JPG, PNG)
// No auth required so unauthenticated users (tutors during signup) can upload
router.post("/document", upload.single("file"), UploadController.uploadDocument);

export default router;
