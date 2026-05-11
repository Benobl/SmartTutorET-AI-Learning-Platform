import Announcement from "./announcement.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import { io } from "../../lib/socket.js";
import { NotificationService } from "../notifications/notification.service.js";

export class AnnouncementController {
    static async createAnnouncement(req, res, next) {
        try {
            const { title, body, category, targetGrade } = req.body;
            
            const announcement = await Announcement.create({
                title,
                body,
                category,
                targetGrade,
                targetTutor: req.user.role === 'tutor' ? req.user._id : null,
                createdBy: req.user._id,
                role: req.user.role
            });

            // Populate creator info for the live broadcast
            const populated = await announcement.populate("createdBy", "name role");

            // Broadcast to all connected users
            // Frontend components can listen for this and show a toast/notification
            io.emit("new-announcement", populated);

            // Create persistent notifications for target audience
            NotificationService.notifyBroadcast(populated);

            res.status(201).json({ success: true, data: populated });
        } catch (error) {
            next(error);
        }
    }

    static async getAnnouncements(req, res, next) {
        try {
            const { grade } = req.query;
            
            let query = {};
            if (req.user.role === 'student') {
                const userGrade = req.user.grade ? String(req.user.grade) : (req.query.grade || "");
                query = {
                    $or: [
                        { targetGrade: userGrade },
                        { targetGrade: "" },
                        { targetGrade: null },
                        { targetGrade: "all" } // Adding a common alternative
                    ]
                };
                // Future: Add logic to filter tutor announcements by enrolled courses
            } else if (req.user.role === 'tutor') {
                // Tutors see everything from admins/managers + their own
                query = {
                    $or: [
                        { createdBy: req.user._id },
                        { role: 'admin' },
                        { role: 'manager' }
                    ]
                };
            }

            const announcements = await Announcement.find(query)
                .populate("createdBy", "name role")
                .sort({ createdAt: -1 });

            res.json({ success: true, data: announcements });
        } catch (error) {
            next(error);
        }
    }

    static async deleteAnnouncement(req, res, next) {
        try {
            const { id } = req.params;
            const announcement = await Announcement.findById(id);
            if (!announcement) throw new ApiError(404, "Announcement not found");

            if (String(announcement.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
                throw new ApiError(403, "Not authorized to delete this announcement");
            }

            await announcement.deleteOne();
            res.json({ success: true, message: "Announcement deleted" });
        } catch (error) {
            next(error);
        }
    }
}
