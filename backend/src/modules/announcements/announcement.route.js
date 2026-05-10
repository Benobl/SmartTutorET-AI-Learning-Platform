import express from "express";
import { AnnouncementController } from "./announcement.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, AnnouncementController.getAnnouncements);
router.post("/", verifyToken, AnnouncementController.createAnnouncement);
router.delete("/:id", verifyToken, AnnouncementController.deleteAnnouncement);

export default router;
