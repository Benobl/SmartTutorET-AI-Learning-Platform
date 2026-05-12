import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { connectDB } from "./src/lib/db.js";
import { app, server } from "./src/lib/socket.js";
import logger from "./src/config/logger.js";
import { errorHandler } from "./src/middleware/error.middleware.js";
import { requestLogger } from "./src/middleware/logger.middleware.js";
import { csrfProtection } from "./src/middleware/csrf.middleware.js";
const VERSION = "1.0.12-dashboard-complete";

// Routes
import authRoutes from "./src/modules/auth/auth.route.js";
import userRoutes from "./src/modules/users/user.route.js";
import aiRoutes from "./src/modules/ai/ai.route.js";
import courseRoutes from "./src/modules/courses/subject.route.js";
import liveRoutes from "./src/modules/live/live.route.js";
import tutorRoutes from "./src/modules/tutors/tutor.route.js";
import groupRoutes from "./src/modules/groups/group.route.js";
import paymentRoutes from "./src/modules/payments/payment.route.js";
import adminRoutes from "./src/modules/admin/admin.route.js";
import notificationRoutes from "./src/modules/notifications/notification.route.js";
import questionRoutes from "./src/modules/questions/question.route.js";
import inviteRoutes from "./src/modules/invites/invite.route.js";
import chatRoutes from "./src/modules/chat/chat.route.js";
import uploadRoutes from "./src/modules/upload/upload.route.js";
import assessmentRoutes from "./src/modules/assessments/assessment.route.js";
import assignmentRoutes from "./src/modules/assessments/assignment.route.js";
import masterScheduleRoutes from "./src/modules/scheduling/master-schedule.route.js";
import learningRoutes from "./src/modules/learning/learning.route.js";
import attendanceRoutes from "./src/modules/attendance/attendance.route.js";
import announcementRoutes from "./src/modules/announcements/announcement.route.js";
import gamificationRoutes from "./src/modules/gamification/gamification.route.js";
import { fileURLToPath } from "url";
import path from "path";
import { initCronJobs } from "./src/lib/cron.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Cron Jobs
initCronJobs();

const PORT = process.env.PORT || 5001;

app.use(cookieParser());

// --- CORS MUST BE FIRST ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "X-ST-CSRF", "X-CSRF-Token"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(mongoSanitize());
app.use(hpp());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Morgan only in non-production
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(requestLogger);
app.use(csrfProtection);

// Serve uploaded documents (syllabus, images) as static files
app.use("/uploads/syllabus", express.static(path.join(__dirname, "uploads/syllabus"), {
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
}));

// Serve uploaded videos — force inline playback, prevent download
app.use("/uploads/videos", (req, res, next) => {
  // Block direct download attempts via query strings
  if (req.query.download) {
    return res.status(403).json({ error: "Downloading videos is not permitted." });
  }
  next();
}, express.static(path.join(__dirname, "uploads/videos"), {
  setHeaders: (res, filePath) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Force inline viewing — prevents the browser from offering a download dialog
    res.setHeader("Content-Disposition", "inline");
    // Prevent caching of private video content
    res.setHeader("Cache-Control", "no-store, private");
  }
}));


// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: "Too many requests. Please try again later." }
});

// Stricter Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts per 15 mins
  message: { success: false, message: "Invalid credentials" }, // Masked message
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth/verify-email", authLimiter);

// Module Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/scheduling", masterScheduleRoutes);
app.use("/api/v2/learning", learningRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/gamification", gamificationRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    success: true,
    status: "Running",
    version: VERSION,
    database: dbStatus,
    timestamp: new Date()
  });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "SmartTutorET Modular API Running", version: VERSION });
});

// Centralized Error Handling
app.use(errorHandler);

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...", { error: err.message, stack: err.stack });
  process.exit(1);
});

// Connect to Database (allow API boot even if DB is temporarily down)
try {
  await connectDB();
} catch (error) {
  logger.error("Database connection failed during startup", {
    error: error.message,
  });
}

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
