import { ChatService } from "./chat.service.js";

export class ChatController {
    /**
     * Get chat history for a squad
     */
    static async getSquadHistory(req, res, next) {
        try {
            const history = await ChatService.getSquadHistory(req.params.squadId);
            res.json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get direct message history
     */
    static async getDirectHistory(req, res, next) {
        try {
            const { otherUserId } = req.params;
            const history = await ChatService.getDirectHistory(req.user._id, otherUserId);
            res.json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark messages as seen
     */
    static async markSeen(req, res, next) {
        try {
            const { messageIds } = req.body;
            await ChatService.markAsSeen(messageIds);
            res.json({ success: true, message: "Messages marked as seen" });
        } catch (error) {
            next(error);
        }
    }
}
