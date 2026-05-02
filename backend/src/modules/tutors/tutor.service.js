import TutorApplication from "./application.model.js";
import TutorJob from "./job.model.js";
import User from "../users/user.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class TutorService {
    static async getJobs() {
        return await TutorJob.find().populate("createdBy", "name email");
    }

    static async applyTutor(userId, jobId, expertise, experience) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        if (user.role !== "student") throw new ApiError(403, "Only students can apply to become tutors");

        const existing = await TutorApplication.findOne({ userId, jobId });
        if (existing) throw new ApiError(400, "You have already applied for this job");

        return await TutorApplication.create({
            userId,
            jobId,
            expertise,
            experience
        });
    }

    static async getMyApplications(userId) {
        return await TutorApplication.find({ userId }).populate("jobId");
    }
}
