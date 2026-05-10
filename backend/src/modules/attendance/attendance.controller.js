import Attendance from "./attendance.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class AttendanceController {
    static async logAttendance(req, res, next) {
        try {
            const { subjectId, sessionId } = req.body;
            if (!subjectId || !sessionId) {
                throw new ApiError(400, "Subject ID and Session ID are required.");
            }

            const attendance = await Attendance.findOneAndUpdate(
                { student: req.user._id, session: sessionId },
                { student: req.user._id, subject: subjectId, session: sessionId, status: "present" },
                { upsert: true, new: true }
            );

            res.json({ success: true, data: attendance });
        } catch (error) {
            next(error);
        }
    }

    static async getTutorAttendance(req, res, next) {
        try {
            const { subjectId } = req.params;
            const attendance = await Attendance.find({ subject: subjectId })
                .populate("student", "name email profile.avatar")
                .sort({ createdAt: -1 });

            res.json({ success: true, data: attendance });
        } catch (error) {
            next(error);
        }
    }

    static async getMyAttendance(req, res, next) {
        try {
            const attendance = await Attendance.find({ student: req.user._id })
                .populate("subject", "title")
                .sort({ createdAt: -1 });

            res.json({ success: true, data: attendance });
        } catch (error) {
            next(error);
        }
    }
}
