import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// ── Syllabus upload (PDF only) ────────────────────────────────
export const uploadSyllabus = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Only PDF files are allowed!"), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ── General document upload (PDF + images) ───────────────────
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Invalid file type. Only PDF and images are allowed."), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ── Video upload (MP4, WebM, MOV) ────────────────────────────
export const uploadVideo = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "video/mp4", "video/webm", "video/quicktime", "video/x-matroska",
            "application/pdf", 
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Invalid file type. Only videos, PDFs, and PPTs are allowed."), false);
    },
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});
