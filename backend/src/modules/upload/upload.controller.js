import { uploadToSupabase } from "../../lib/supabase.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class UploadController {
    static async uploadDocument(req, res, next) {
        try {
            if (!req.file) {
                throw new ApiError(400, "No file uploaded");
            }

            const fileType = req.body.type || "document";
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const extension = req.file.originalname.split(".").pop();
            const filename = `${fileType}-${uniqueSuffix}.${extension}`;

            const fileUrl = await uploadToSupabase(req.file.buffer, filename, 'pedagogical-content', req.file.mimetype);

            return res.status(200).json({
                success: true,
                message: "File uploaded successfully",
                data: {
                    url: fileUrl,
                    filename: filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    type: fileType,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
