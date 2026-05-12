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
            const stats = await AdminService.getSystemStats(req.user._id);
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

    // --- Module Management ---

    static async getPayments(req, res, next) {
        try {
            const payments = await AdminService.getAllPayments();
            res.json({ success: true, data: payments });
        } catch (error) {
            next(error);
        }
    }

    static async getLiveSessions(req, res, next) {
        try {
            const sessions = await AdminService.getAllLiveSessions();
            res.json({ success: true, data: sessions });
        } catch (error) {
            next(error);
        }
    }



    static async getAssessments(req, res, next) {
        try {
            const assessments = await AdminService.getAllAssessments();
            res.json({ success: true, data: assessments });
        } catch (error) {
            next(error);
        }
    }

    static async getForums(req, res, next) {
        try {
            const forums = await AdminService.getAllForums();
            res.json({ success: true, data: forums });
        } catch (error) {
            next(error);
        }
    }

    static async getAnalytics(req, res, next) {
        try {
            const analytics = await AdminService.getAnalytics(req.query.range);
            res.json({ success: true, data: analytics });
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            if (req.params.userId === req.user._id.toString()) {
                throw new ApiError(400, "Security Violation: You cannot delete your own administrative account while logged in.");
            }
            await AdminService.deleteUser(req.params.userId);
            res.json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            next(error);
        }
    }

    static async appointManager(req, res, next) {
        try {
            const user = await AdminService.appointManager(req.body.email);
            res.json({ success: true, message: `User ${user.name} is now a Manager`, data: user });
        } catch (error) {
            next(error);
        }
    }

    static async updateUser(req, res, next) {
        try {
            const user = await AdminService.updateUser(req.params.userId, req.body);
            res.json({ success: true, message: "User updated successfully", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async getSettings(req, res, next) {
        try {
            const settings = await AdminService.getSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    static async updateSettings(req, res, next) {
        try {
            const settings = await AdminService.updateSettings(req.body, req.user._id);
            res.json({ success: true, message: "Settings updated", data: settings });
        } catch (error) {
            next(error);
        }
    }

    static async updateUserStatus(req, res, next) {
        try {
            const { userId } = req.params;
            const { status } = req.body;
            const user = await AdminService.updateUserStatus(userId, status);
            res.json({ success: true, message: `User status updated to ${status}`, data: user });
        } catch (error) {
            next(error);
        }
    }

    static async getHealth(req, res, next) {
        try {
            const health = await AdminService.getSystemHealth();
            res.json({ success: true, data: health });
        } catch (error) {
            next(error);
        }
    }

    static async getFlags(req, res, next) {
        try {
            const flags = await AdminService.getAllFlags();
            res.json({ success: true, data: flags });
        } catch (error) {
            next(error);
        }
    }

    static async resolveFlag(req, res, next) {
        try {
            const flag = await AdminService.resolveFlag(req.params.id, req.user._id, req.body.note);
            res.json({ success: true, message: "Flag resolved successfully", data: flag });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req, res, next) {
        try {
            const { userId } = req.params;
            const { newPassword } = req.body;
            await AdminService.resetUserPassword(userId, newPassword);
            res.json({ success: true, message: "User password reset successfully" });
        } catch (error) {
            next(error);
        }
    }
}
