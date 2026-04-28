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

    /**
     * Edit a message's text (only by the sender)
     */
    static async editMessage(messageId, senderId, newText) {
        const msg = await ChatMessage.findById(messageId);
        if (!msg) throw new ApiError(404, "Message not found");
        if (msg.senderId.toString() !== senderId.toString()) throw new ApiError(403, "Not authorized to edit this message");
        return await ChatMessage.findByIdAndUpdate(
            messageId,
            { text: newText, isEdited: true },
            { new: true }
        );
    }

    /**
     * Soft-delete a message (only by the sender)
     */
    static async deleteMessage(messageId, senderId) {
        const msg = await ChatMessage.findById(messageId);
        if (!msg) throw new ApiError(404, "Message not found");
        if (msg.senderId.toString() !== senderId.toString()) throw new ApiError(403, "Not authorized to delete this message");
        return await ChatMessage.findByIdAndUpdate(
            messageId,
            { text: "This message was deleted", isDeleted: true },
            { new: true }
        );
    }
}
