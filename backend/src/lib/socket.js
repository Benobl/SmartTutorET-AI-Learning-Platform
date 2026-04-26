import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // --- Chat ---
    socket.on("sendMessage", (data) => {
        const { receiverId, message } = data;
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }
    });

    // --- Virtual Whiteboard ---
    socket.on("whiteboard-draw", (data) => {
        // data: { roomId, x, y, prevX, prevY, color, size }
        socket.to(data.roomId).emit("whiteboard-draw", data);
    });

    socket.on("whiteboard-clear", (roomId) => {
        socket.to(roomId).emit("whiteboard-clear");
    });

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // --- WebRTC Signaling (Video/Screen Share) ---
    socket.on("call-user", (data) => {
        // data: { userToCall, signalData, from, name }
        const receiverSocketId = getReceiverSocketId(data.userToCall);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("call-made", {
                signal: data.signalData,
                from: data.from,
                name: data.name,
            });
        }
    });

    socket.on("answer-call", (data) => {
        // data: { signal, to }
        const receiverSocketId = getReceiverSocketId(data.to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("call-answered", data.signal);
        }
    });

    socket.on("ice-candidate", (data) => {
        // data: { candidate, to }
        const receiverSocketId = getReceiverSocketId(data.to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("ice-candidate", data.candidate);
        }
    });

    // --- Typing Indicators ---
    socket.on("typing", (data) => {
        const { receiverId } = data;
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", { senderId: userId });
        }
    });

    socket.on("stop-typing", (data) => {
        const { receiverId } = data;
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stop-typing", { senderId: userId });
        }
    });

    // --- Message Seen ---
    socket.on("message-seen", (data) => {
        const { senderId } = data; // the one who sent the message
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("message-seen", { receiverId: userId });
        }
    });

    // --- Room Support (for Squads) ---
    socket.on("join-squad", (squadId) => {
        socket.join(`squad_${squadId}`);
        console.log(`User ${userId} joined squad room: squad_${squadId}`);
    });

    socket.on("send-squad-message", (data) => {
        const { squadId, message } = data;
        io.to(`squad_${squadId}`).emit("new-squad-message", { ...message, senderId: userId });
    });

    socket.on("squad-live-started", (data) => {
        const { squadId } = data;
        socket.to(`squad_${squadId}`).emit("squad-live-started", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };
