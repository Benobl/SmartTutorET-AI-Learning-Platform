import User from "../users/user.model.js";
import TutorJob from "../tutors/job.model.js";
import TutorApplication from "../tutors/application.model.js";
import Subject from "../courses/subject.model.js";
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
        user.isApproved = true;
        await user.save();

        sendTutorApprovalEmail(user.email, user.name).catch(err => console.error("Email error:", err));
        return user;
    }

    static async rejectTutor(userId, reason) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        if (user.role !== "tutor") throw new ApiError(400, "User is not a tutor");

        user.tutorStatus = "rejected";
        user.isApproved = false; // Ensure rejected tutors cannot log in
        await user.save();

        sendTutorRejectionEmail(user.email, user.name, reason).catch(err => console.error("Email error:", err));
        return user;
    }

    static async getApplications() {
        return await TutorApplication.find().populate("userId", "name email").populate("jobId", "title");
    }

    static async getSystemStats() {
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalTutors = await User.countDocuments({ role: "tutor", tutorStatus: "approved" });
        const pendingTutors = await User.countDocuments({ role: "tutor", tutorStatus: "pending" });
        const totalJobs = await TutorJob.countDocuments();
        
        return {
            totalStudents,
            totalTutors,
            pendingTutors,
            totalJobs
        };
    }

    static async getAllJobs() {
        return await TutorJob.find().populate("createdBy", "name email");
    }

    static async deleteTutorJob(jobId) {
        return await TutorJob.findByIdAndDelete(jobId);
    }

    // --- Subject Approval ---
    static async getPendingSubjects() {
        return await Subject.find({ status: "pending" }).populate("tutor", "name email");
    }

    static async approveSubject(subjectId) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");
        subject.status = "approved";
        return await subject.save();
    }

    static async rejectSubject(subjectId) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");
        subject.status = "rejected";
        return await subject.save();
    }

    // --- Monitoring ---
    static async getAllUsers() {
        return await User.find().select("-password");
    }

    static async getStudentProgress(studentId) {
        // Find subjects where student is enrolled
        const subjects = await Subject.find({ students: studentId }).populate("tutor", "name");
        return subjects;
    }
}
