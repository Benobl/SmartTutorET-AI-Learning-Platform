import Notification from "./notification.model.js";
import User from "../auth/user.model.js";

export class NotificationService {
    static async notifyEnrolledStudents(subject, message, type = "course_update") {
        try {
            const studentIds = subject.students || [];
            if (studentIds.length === 0) return;

            // 1. In-App Notifications (Bulk Create)
            const notifications = studentIds.map(studentId => ({
                user: studentId,
                message: message,
                type: type
            }));
            await Notification.insertMany(notifications);

            // 2. Email Notifications (Mock/Placeholder for now)
            // In a real system, you would use nodemailer or SendGrid here
            console.log(`📡 Sending emails to ${studentIds.length} students about course: ${subject.title}`);
            
            return { success: true, count: studentIds.length };
        } catch (error) {
            console.error("❌ Notification Error:", error);
        }
    }

    static async getUserNotifications(userId) {
        return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
    }

    static async markAsRead(notificationId) {
        return Notification.findByIdAndUpdate(notificationId, { isRead: true });
    }
}
