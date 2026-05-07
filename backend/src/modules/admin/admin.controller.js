import { AdminService } from "./admin.service.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class AdminController {
    static async createJob(req, res, next) {
        try {
            if (req.user.role !== "manager" && req.user.role !== "admin") {
                throw new ApiError(403, "Access denied: Only managers or admins");
            }
            const job = await AdminService.createTutorJob(req.user._id, req.body);
            res.status(201).json({ success: true, data: job });
        } catch (error) {
            next(error);
        }
    }

    static async getPending(req, res, next) {
        try {
            const tutors = await AdminService.getPendingTutors();
            res.json({ success: true, data: tutors });
        } catch (error) {
            next(error);
        }
    }

    static async approve(req, res, next) {
        try {
            const user = await AdminService.approveTutor(req.params.userId);
            res.json({ success: true, message: "Tutor approved successfully", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async reject(req, res, next) {
        try {
            const user = await AdminService.rejectTutor(req.params.userId, req.body.reason);
            res.json({ success: true, message: "Tutor application rejected", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async getStats(req, res, next) {
        try {
            const stats = await AdminService.getSystemStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getJobs(req, res, next) {
        try {
            const jobs = await AdminService.getAllJobs();
            res.json({ success: true, data: jobs });
        } catch (error) {
            next(error);
        }
    }

    static async deleteJob(req, res, next) {
        try {
            await AdminService.deleteTutorJob(req.params.id);
            res.json({ success: true, message: "Job deleted successfully" });
        } catch (error) {
            next(error);
        }
    }

    static async getPendingSubjects(req, res, next) {
        try {
            const subjects = await AdminService.getPendingSubjects();
            res.json({ success: true, data: subjects });
        } catch (error) {
            next(error);
        }
    }

    static async approveSubject(req, res, next) {
        try {
            const subject = await AdminService.approveSubject(req.params.id);
            res.json({ success: true, message: "Subject approved", data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async rejectSubject(req, res, next) {
        try {
            const subject = await AdminService.rejectSubject(req.params.id, req.body.feedback);
            res.json({ success: true, message: "Subject rejected", data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async getUsers(req, res, next) {
        try {
            const users = await AdminService.getAllUsers();
            res.json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    }

    static async getProgress(req, res, next) {
        try {
            const progress = await AdminService.getStudentProgress(req.params.studentId);
            res.json({ success: true, data: progress });
        } catch (error) {
            next(error);
        }
    }
}
