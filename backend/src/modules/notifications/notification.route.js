import express from "express";
import { NotificationController } from "./notification.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/mine", NotificationController.getMyNotifications);
router.post("/send", allowRoles("tutor", "admin", "manager"), NotificationController.send);
router.patch("/mark-read/:id", NotificationController.markAsRead);
router.patch("/mark-all-read", NotificationController.markAllAsRead);

export default router;
