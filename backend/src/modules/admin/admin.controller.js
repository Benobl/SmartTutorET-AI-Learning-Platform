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
}
