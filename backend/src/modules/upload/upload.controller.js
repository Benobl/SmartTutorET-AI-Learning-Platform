import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class UploadController {
    static uploadDocument(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            const fileType = req.body.type || "document"; // 'degree' or 'cv'
            const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
            // Files are stored under uploads/syllabus by middleware, and served via /uploads/syllabus
            const fileUrl = `${backendUrl}/uploads/syllabus/${req.file.filename}`;

            return res.status(200).json({
                success: true,
                message: "File uploaded successfully",
                data: {
                    url: fileUrl,
                    filename: req.file.filename,
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
