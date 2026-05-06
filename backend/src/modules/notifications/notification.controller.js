import Notification from "./notification.model.js";

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
}
