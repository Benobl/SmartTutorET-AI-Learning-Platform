import { LiveService } from "./live.service.js";
import { uploadToSupabase } from "../../lib/supabase.js";
import { ApiError } from "../../middleware/error.middleware.js";

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
            console.log(`[Upload] Received recording upload request. File: ${req.file ? req.file.originalname : 'MISSING'}`);
            if (!req.file) throw new ApiError(400, "No recording file provided.");
            
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const extension = req.file.originalname.split(".").pop();
            const filename = `recording-${uniqueSuffix}.${extension}`;

            const fileUrl = await uploadToSupabase(req.file.buffer, filename, 'pedagogical-content', req.file.mimetype);
            res.json({ success: true, url: fileUrl });
        } catch (error) {
            next(error);
        }
    }
}
