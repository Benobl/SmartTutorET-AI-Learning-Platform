import User from "./user.model.js";
import FriendRequest from "./friend.model.js";
import PeerQuestion from "./question.model.js";
import PeerAnswer from "./answer.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import { upsertStreamUser } from "../../lib/stream.js";

export class UserService {
    static async onboard(userId, onboardingData) {
        const user = await User.findByIdAndUpdate(
            userId,
            { ...onboardingData, isOnboarded: true },
            { new: true }
        );

        if (!user) throw new ApiError(404, "User not found");

        // Sync with Stream
        upsertStreamUser({
            id: user._id.toString(),
            name: user.fullName,
            image: user.profilePic || "",
        }).catch(err => console.error("Stream sync error during onboarding:", err));

        return user;
    }

    static async updateProfile(userId, profileData) {
        const user = await User.findByIdAndUpdate(userId, profileData, { new: true });
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async getProfile(userId) {
        const user = await User.findById(userId).select("-password").populate("friends", "fullName profilePic");
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async sendFriendRequest(senderId, receiverId) {
        if (senderId.toString() === receiverId.toString()) {
            throw new ApiError(400, "You cannot send a friend request to yourself");
        }

        const existing = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
        if (existing) throw new ApiError(400, "Friend request already sent");

        return await FriendRequest.create({ sender: senderId, receiver: receiverId });
    }

    static async askQuestion(authorId, questionData) {
        return await PeerQuestion.create({
            ...questionData,
            authorId
        });
    }

    static async answerQuestion(authorId, questionId, content) {
        return await PeerAnswer.create({
            questionId,
            authorId,
            content
        });
    }
}
