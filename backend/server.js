import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js"
import groupRoutes from "./routes/group.route.js";
import forumRoutes from "./routes/forum.route.js";
import questionRoutes from "./routes/question.route.js";
import inviteRoutes from "./routes/invite.route.js";
import liveSessionRoutes from "./routes/liveSession.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT;


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes)
app.use("/api/groups", groupRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/live", liveSessionRoutes);
app.use("/api/payment", paymentRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
  connectDB();
});
