import User from "../users/user.model.js";
import TutorJob from "../tutors/job.model.js";
import TutorApplication from "../tutors/application.model.js";
import { sendTutorApprovalEmail, sendTutorRejectionEmail } from "../../lib/email.service.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class AdminService {
    static async createTutorJob(managerId, jobData) {
        return await TutorJob.create({
            ...jobData,
            createdBy: managerId
        });
    }

    static async getPendingTutors() {
        return await User.find({
            role: "tutor",
            tutorStatus: "pending"
        }).select("-password");
    }

    static async approveTutor(userId) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        if (user.role !== "tutor") throw new ApiError(400, "User is not a tutor");

        user.tutorStatus = "approved";
        await user.save();

        sendTutorApprovalEmail(user.email, user.name).catch(err => console.error("Email error:", err));
        return user;
    }

    static async rejectTutor(userId, reason) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        if (user.role !== "tutor") throw new ApiError(400, "User is not a tutor");

        user.tutorStatus = "rejected";
        await user.save();

        sendTutorRejectionEmail(user.email, user.name, reason).catch(err => console.error("Email error:", err));
        return user;
    }

    static async getApplications() {
        return await TutorApplication.find().populate("userId", "name email").populate("jobId", "title");
    }
}
