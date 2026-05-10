import { LiveService } from "./live.service.js";

export class LiveController {
    static async join(req, res, next) {
        try {
            const session = await LiveService.joinSession(req.params.sessionId, req.user._id);
            res.json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async getActive(req, res, next) {
        try {
            const sessions = await LiveService.getActiveSessions();
            res.json({ success: true, data: sessions });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const session = await LiveService.createSession(req.user._id, req.body);
            res.status(201).json({ success: true, data: session });
        } catch (error) {
            next(error);
        }
    }

    static async end(req, res, next) {
        try {
            const { recordingUrl } = req.body;
            const session = await LiveService.endSession(req.params.sessionId, req.user._id, recordingUrl);
            res.json({ success: true, message: "Session ended", data: session });
        } catch (error) {
            next(error);
        }
    }

    static async getRecordings(req, res, next) {
        try {
            const recordings = await LiveService.getTutorRecordings(req.user._id);
            res.json({ success: true, data: recordings });
        } catch (error) {
            next(error);
        }
    }

    static async uploadRecording(req, res, next) {
        try {
            console.log(`[Upload] Received recording upload request. File: ${req.file ? req.file.filename : 'MISSING'}`);
            if (!req.file) throw new ApiError(400, "No recording file provided.");
            
            const fileUrl = `${process.env.BASE_URL}/uploads/videos/${req.file.filename}`;
            res.json({ success: true, url: fileUrl });
        } catch (error) {
            next(error);
        }
    }
}
