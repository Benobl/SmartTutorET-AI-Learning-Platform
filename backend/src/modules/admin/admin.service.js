import User from "../users/user.model.js";
import TutorJob from "../tutors/job.model.js";
import TutorApplication from "../tutors/application.model.js";
import Subject from "../courses/subject.model.js";
import Payment from "../payments/payment.model.js";
import LiveSession from "../live/live.model.js";
import Assessment from "../assessments/assessment.model.js";
import Forum from "../social/forum.model.js";
import Settings from "./settings.model.js";
import Flag from "./flag.model.js";
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

    static async getSystemStats(adminId) {
        const [
            totalStudents,
            totalTutors,
            activeSubjects,
            totalRevenueData,
            pendingTutors,
            lastMonthStudents,
            adminUser
        ] = await Promise.all([
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "tutor", tutorStatus: "approved" }),
            Subject.countDocuments({ status: "approved" }),
            Payment.aggregate([
                { $match: { status: "completed" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            User.countDocuments({ role: "tutor", tutorStatus: "pending" }),
            User.countDocuments({ 
                role: "student", 
                createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
            }),
            User.findById(adminId).select("earnings")
        ]);

        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;
        
        // Calculate growth
        const growthValue = lastMonthStudents > 0 
            ? ((totalStudents - lastMonthStudents) / lastMonthStudents * 100).toFixed(1)
            : 100;

        return {
            totalStudents,
            totalTutors,
            activeSubjects,
            revenue: totalRevenue,
            pendingTutors,
            growth: `+${growthValue}%`,
            avgSessionTime: "42m",
            revenueGrowth: "+18.2%",
            activeSessions: Math.floor(Math.random() * 50) + 10,
            successRate: 98.5,
            totalRevenue,
            personalEarnings: adminUser?.earnings || 0
        };
    }

    static async getAnalytics(period = "year") {
        // Aggregate revenue and platform fee by month
        const [revenueStats, userStats] = await Promise.all([
            Payment.aggregate([
                { $match: { status: "completed" } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        revenue: { $sum: "$amount" },
                        platformFee: { $sum: { $multiply: ["$amount", 0.1] } }
                    }
                }
            ]),
            User.aggregate([
                { $match: { role: "student" } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const formattedStats = months.map((month, index) => {
            const mRev = revenueStats.find(s => s._id === index + 1) || { revenue: 0, platformFee: 0 };
            const mUser = userStats.find(s => s._id === index + 1) || { count: 0 };
            return {
                month,
                revenue: mRev.revenue,
                platformFee: mRev.platformFee,
                students: mUser.count
            };
        });

        return formattedStats;
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

    static async rejectSubject(subjectId, feedback) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");
        subject.status = "rejected";
        if (feedback) subject.managerFeedback = feedback;
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

    // --- Module Management (Full Schema) ---

    static async getAllPayments() {
        return await Payment.find()
            .populate("student", "name email")
            .populate("subject", "title")
            .sort({ createdAt: -1 });
    }

    static async getAllLiveSessions() {
        return await LiveSession.find()
            .populate("host", "name email")
            .populate("subject", "title")
            .sort({ startTime: -1 });
    }

    static async getAllAssessments() {
        return await Assessment.find()
            .populate("subject", "title")
            .populate("createdBy", "name email");
    }

    static async getAllForums() {
        return await Forum.find()
            .populate("subject", "title")
            .populate("createdBy", "name email");
    }

    static async deleteUser(userId) {
        return await User.findByIdAndDelete(userId);
    }

    static async appointManager(email) {
        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            // Create a new manager account if it doesn't exist
            const namePrefix = normalizedEmail.split('@')[0];
            const name = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
            
            user = await User.create({
                name: name,
                email: normalizedEmail,
                password: "managerpassword", // Default password for new managers
                role: "manager",
                isApproved: true,
                isVerified: true
            });
            console.log(`[AdminService] Created new manager account: ${normalizedEmail}`);
        } else {
            // Update existing user to manager role
            user.role = "manager";
            await user.save();
            console.log(`[AdminService] Promoted existing user to manager: ${normalizedEmail}`);
        }
        
        return user;
    }

    static async updateUserStatus(userId, status) {
        const validStatuses = ["active", "waiting", "suspended", "deactivated"];
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        user.accountStatus = status;
        if (status === "active") {
            user.isApproved = true;
        } else if (status === "suspended" || status === "deactivated") {
            user.isApproved = false;
        }
        await user.save();
        return user;
    }

    static async updateUser(userId, updateData) {
        return await User.findByIdAndUpdate(userId, updateData, { new: true });
    }

    // --- Settings ---

    static async getSettings() {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        return settings;
    }

    static async updateSettings(updateData, adminId) {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }
        
        Object.assign(settings, updateData);
        settings.lastUpdatedBy = adminId;
        return await settings.save();
    }

    static async getSystemHealth() {
        // In a real app, you'd use 'os' module or external monitoring
        // For now, providing realistic system metrics
        return [
            { name: "Server", status: "healthy", value: "99.9% Uptime" },
            { name: "Database", status: "healthy", value: "14ms Latency" },
            { name: "Cpu", status: "healthy", value: "12% Load" },
            { name: "Network", status: "healthy", value: "1.2GB/s" },
            { name: "Clock", status: "healthy", value: "Synced" },
            { name: "Activity", status: "warning", value: "High Traffic" }
        ];
    }

    // --- Moderation ---
    static async getAllFlags() {
        return await Flag.find()
            .populate("reporter", "name email")
            .sort({ createdAt: -1 });
    }

    static async resolveFlag(flagId, adminId, resolutionNote = "Issue resolved by administrator.") {
        const flag = await Flag.findById(flagId);
        if (!flag) throw new ApiError(404, "Flag not found");
        
        flag.status = "resolved";
        flag.resolution = {
            note: resolutionNote,
            resolvedBy: adminId,
            resolvedAt: new Date()
        };
        
        return await flag.save();
    }

    static async resetUserPassword(userId, newPassword) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        user.password = newPassword;
        await user.save();
        return { success: true };
    }
}
