import Notification from "./notification.model.js";
import { NotificationService } from "./notification.service.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class NotificationController {
    static async getMyNotifications(req, res, next) {
        try {
            const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
            res.json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(req, res, next) {
        try {
            await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
            res.json({ success: true, message: "Notification marked as read" });
        } catch (error) {
            next(error);
        }
    }

    static async markAllAsRead(req, res, next) {
        try {
            await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
            res.json({ success: true, message: "All notifications marked as read" });
        } catch (error) {
            next(error);
        }
    }

    static async send(req, res, next) {
        try {
            const { userIds, message, type } = req.body || {};
            if (!message || typeof message !== "string" || message.trim().length < 1) {
                throw new ApiError(400, "Message is required.");
            }
            if (!Array.isArray(userIds) || userIds.length === 0) {
                throw new ApiError(400, "userIds[] is required.");
            }

            const result = await NotificationService.sendToUsers({
                senderId: req.user?._id,
                userIds,
                message: message.trim(),
                type: type || "direct_message",
            });
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
