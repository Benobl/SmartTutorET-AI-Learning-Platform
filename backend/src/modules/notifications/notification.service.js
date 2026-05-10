import Notification from "./notification.model.js";
import User from "../users/user.model.js";

export class NotificationService {
    static async notifyEnrolledStudents(subject, message, type = "course_update") {
        try {
            const studentIds = subject.students || [];
            if (studentIds.length === 0) return;

            const notifications = studentIds.map(studentId => ({
                user: studentId,
                message: message,
                type: type
            }));
            await Notification.insertMany(notifications);

            console.log(`📡 Notified ${studentIds.length} students about: ${subject.title}`);
            return { success: true, count: studentIds.length };
        } catch (error) {
            console.error("❌ Notification Error:", error);
        }
    }

    /**
     * Fired after a student completes payment.
     * Notifies: the course tutor + all managers + all admins.
     */
    static async notifyPaymentReceived(payment) {
        try {
            const studentName = payment.student?.name || "A student";
            const courseTitle = payment.subject?.title || "a course";
            const amount = payment.amount || 0;
            const tutorId = payment.subject?.tutor;

            const notificationsToCreate = [];

            // 1. Notify the tutor
            if (tutorId) {
                notificationsToCreate.push({
                    user: tutorId,
                    message: `💰 ${studentName} just paid ${amount} ETB for your course: "${courseTitle}". They are now enrolled.`,
                    type: "payment_received"
                });
            }

            // 2. Notify all managers and admins
            const staffUsers = await User.find({ role: { $in: ["manager", "admin"] } }).select("_id");
            staffUsers.forEach(staff => {
                notificationsToCreate.push({
                    user: staff._id,
                    message: `💰 New payment: ${studentName} paid ${amount} ETB for "${courseTitle}".`,
                    type: "payment_received"
                });
            });

            if (notificationsToCreate.length > 0) {
                await Notification.insertMany(notificationsToCreate);
                console.log(`📡 Payment notifications sent to ${notificationsToCreate.length} recipients.`);
            }

            return { success: true };
        } catch (error) {
            console.error("❌ Payment Notification Error:", error);
        }
    }

    static async getUserNotifications(userId) {
        return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30);
    }

    static async markAsRead(notificationId) {
        return Notification.findByIdAndUpdate(notificationId, { isRead: true });
    }

    static async markAllAsRead(userId) {
        return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    }

    static async sendToUsers({ senderId, userIds, message, type = "direct_message" }) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return { success: true, count: 0 };
        }

        const notifications = userIds.map((uid) => ({
            user: uid,
            message,
            type,
        }));

        await Notification.insertMany(notifications);
        return { success: true, count: userIds.length };
    }
}
