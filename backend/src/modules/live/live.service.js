import LiveSession from "./live.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class LiveService {
    static async createSession(hostId, sessionData) {
        return await LiveSession.create({
            ...sessionData,
            host: hostId,
            participants: [hostId]
        });
    }

    static async joinSession(sessionId, userId) {
        const session = await LiveSession.findById(sessionId);
        if (!session) throw new ApiError(404, "Live session not found");
        if (!session.isActive) throw new ApiError(400, "This session has ended");

        if (!session.participants.some(p => p.toString() === userId.toString())) {
            session.participants.push(userId);
            await session.save();
        }

        return session;
    }

    static async endSession(sessionId, hostId, recordingUrl) {
        const session = await LiveSession.findOneAndUpdate(
            { _id: sessionId, host: hostId },
            { 
                isActive: false, 
                endTime: new Date(),
                recordingUrl: recordingUrl || null
            },
            { new: true }
        );
        if (!session) throw new ApiError(404, "Active session not found or you are not the host");

        // Session ended successfully


        return session;
    }

    static async getActiveSessions() {
        return await LiveSession.find({ isActive: true })
            .populate("host", "name profile.avatar")
            .populate("subject", "title");
    }

    static async getTutorRecordings(tutorId) {
        return await LiveSession.find({ 
            host: tutorId, 
            isActive: false, 
            recordingUrl: { $exists: true, $ne: null } 
        })
        .populate("subject", "title code")
        .sort({ endTime: -1 });
    }
}
