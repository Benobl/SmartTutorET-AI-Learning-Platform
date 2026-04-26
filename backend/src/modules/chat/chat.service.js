import ChatMessage from "./chat.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class ChatService {
    /**
     * Save a new message to the database
     */
    static async saveMessage(messageData) {
        return await ChatMessage.create(messageData);
    }

    /**
     * Get chat history for a specific squad
     */
    static async getSquadHistory(squadId, limit = 200) {
        try {
            return await ChatMessage.find({ squadId: squadId })
                .sort({ createdAt: 1 })
                .limit(limit);
        } catch (error) {
            console.error(`[ChatService] Failed to get squad history for ${squadId}:`, error);
            throw error;
        }
    }

    /**
     * Get direct message history between two users
     */
    static async getDirectHistory(userA, userB, limit = 50) {
        return await ChatMessage.find({
            $or: [
                { senderId: userA, receiverId: userB },
                { senderId: userB, receiverId: userA }
            ]
        })
            .sort({ createdAt: 1 })
            .limit(limit);
    }

    /**
     * Mark messages as seen
     */
    static async markAsSeen(messageIds) {
        return await ChatMessage.updateMany(
            { _id: { $in: messageIds } },
            { $set: { status: "seen" } }
        );
    }

    /**
     * Add a reaction to a message
     */
    static async addReaction(messageId, reactionData) {
        return await ChatMessage.findByIdAndUpdate(
            messageId,
            { $push: { reactions: reactionData } },
            { new: true }
        );
    }
}
