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
}
