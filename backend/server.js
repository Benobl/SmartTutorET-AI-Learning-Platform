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

// Routes
import authRoutes from "./src/modules/auth/auth.route.js";
import userRoutes from "./src/modules/users/user.route.js";
import aiRoutes from "./src/modules/ai/ai.route.js";
import courseRoutes from "./src/modules/courses/course.route.js";
import tutorRoutes from "./src/modules/tutors/tutor.route.js";
import groupRoutes from "./src/modules/groups/group.route.js";
import paymentRoutes from "./src/modules/payments/payment.route.js";
import adminRoutes from "./src/modules/admin/admin.route.js";
import questionRoutes from "./src/modules/questions/question.route.js";
import inviteRoutes from "./src/modules/invites/invite.route.js";
import chatRoutes from "./src/modules/chat/chat.route.js";

const PORT = process.env.PORT || 5001;

// --- Security Middlewares ---
app.use(helmet()); // Secure HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token", "X-ST-CSRF"]
}));

// Preflight debug
app.options("*", (req, res) => {
  logger.debug(`[Preflight] OPTIONS ${req.path} from ${req.headers.origin}`);
  res.sendStatus(204);
});

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", globalLimiter);

// --- Standard Middlewares ---
app.use(express.json({ limit: "10kb" })); // Body limit to prevent DDoS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(requestLogger);
app.use(csrfProtection); // Apply CSRF protection

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
app.use("/api/chat", chatRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    success: true,
    status: "Running",
    database: dbStatus,
    timestamp: new Date()
  });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "SmartTutorET Modular API Running" });
});

// Centralized Error Handling
app.use(errorHandler);

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  connectDB();
});
