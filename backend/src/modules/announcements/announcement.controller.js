import Announcement from "./announcement.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

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

            res.status(201).json({ success: true, data: announcement });
        } catch (error) {
            next(error);
        }
    }

    static async getAnnouncements(req, res, next) {
        try {
            const { grade } = req.query;
            
            let query = {};
            if (req.user.role === 'student') {
                // Students see:
                // 1. Manager/Admin announcements for their grade
                // 2. Manager/Admin announcements for ALL grades (targetGrade null)
                // 3. Announcements from THEIR tutors (we can expand this later)
                query = {
                    $or: [
                        { targetGrade: req.user.grade },
                        { targetGrade: null },
                        { role: 'admin' },
                        { role: 'manager' }
                    ]
                };
            } else if (req.user.role === 'tutor') {
                // Tutors see everything or just their own? Let's show everything relevant.
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
