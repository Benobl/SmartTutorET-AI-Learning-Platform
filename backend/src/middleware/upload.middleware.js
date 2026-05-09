import multer from "multer";
import path from "path";
import fs from "fs";

// ── Syllabus upload (PDF only) ────────────────────────────────
const syllabusDir = "uploads/syllabus";
if (!fs.existsSync(syllabusDir)) fs.mkdirSync(syllabusDir, { recursive: true });

const syllabusStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, syllabusDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadSyllabus = multer({
    storage: syllabusStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Only PDF files are allowed!"), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ── General document upload (PDF + images) ───────────────────
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, syllabusDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: documentStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Invalid file type. Only PDF and images are allowed."), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ── Video upload (MP4, WebM, MOV) ────────────────────────────
const videoDir = "uploads/videos";
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, videoDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "lesson-" + uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadVideo = multer({
    storage: videoStorage,
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
