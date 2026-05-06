import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/lib/db.js";
import { app, server } from "./src/lib/socket.js";
import logger from "./src/config/logger.js";
import { errorHandler } from "./src/middleware/error.middleware.js";
import { requestLogger } from "./src/middleware/logger.middleware.js";
import { csrfProtection } from "./src/middleware/csrf.middleware.js";
const VERSION = "1.0.7-manual-cors";

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
import masterScheduleRoutes from "./src/modules/scheduling/master-schedule.route.js";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 5001;

// --- CORS MUST BE FIRST ---
// Manually inject ACAO header for every request to ensure it survives Cloudflare/CDN stripping
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Accept,Origin,X-ST-CSRF,X-CSRF-Token");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }
  next();
});

const corsOptions = {
  origin: true,
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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(requestLogger);
app.use(csrfProtection);

// Serve uploaded documents as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
}));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", globalLimiter);

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
app.use("/api/scheduling", masterScheduleRoutes);

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

// Connect to Database
await connectDB();

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
