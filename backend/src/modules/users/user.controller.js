import { UserService } from "./user.service.js";

export class UserController {
    static async onboard(req, res, next) {
        try {
            const user = await UserService.onboard(req.user._id, req.body);
            res.json({ success: true, message: "Onboarding complete", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async getProfile(req, res, next) {
        try {
            const user = await UserService.getProfile(req.params.userId);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const user = await UserService.updateProfile(req.user._id, req.body);
            res.json({ success: true, message: "Profile updated", data: user });
        } catch (error) {
            next(error);
        }
    }

    static async sendFriendRequest(req, res, next) {
        try {
            const request = await UserService.sendFriendRequest(req.user._id, req.body.receiverId);
            res.status(201).json({ success: true, message: "Request sent", data: request });
        } catch (error) {
            next(error);
        }
    }

    static async getStudents(req, res, next) {
        try {
            const students = await UserService.getStudents();
            res.json({ success: true, data: students });
        } catch (error) {
            next(error);
        }
    }

    static async getTutors(req, res, next) {
        try {
            const tutors = await UserService.getTutors();
            res.json({ success: true, data: tutors });
        } catch (error) {
            next(error);
        }
    }

    static async searchByEmail(req, res, next) {
        try {
            const user = await UserService.searchByEmail(req.query.email);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    static async getStudentStats(req, res, next) {
        try {
            const stats = await UserService.getStudentStats(req.user._id);
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getTutorStats(req, res, next) {
        try {
            const stats = await UserService.getTutorStats(req.user._id);
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    static async getLeaderboard(req, res, next) {
        try {
            const { grade } = req.query;
            const leaderboard = await UserService.getLeaderboard(grade || req.user.grade);
            res.json({ success: true, data: leaderboard });
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req, res, next) {
        try {
            const { currentPassword, oldPassword, newPassword } = req.body;
            const passwordToVerify = currentPassword || oldPassword;
            const { AuthService } = await import("../auth/auth.service.js");
            await AuthService.changePassword(req.user._id, passwordToVerify, newPassword);
            res.json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            next(error);
        }
    }

    static async adminResetPassword(req, res, next) {
        try {
            const { userId, newPassword } = req.body;
            const { AuthService } = await import("../auth/auth.service.js");
            await AuthService.adminResetPassword(userId, newPassword);
            res.json({ success: true, message: "User password reset successfully" });
        } catch (error) {
            next(error);
        }
    }
}
