import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ChatService } from "../modules/chat/chat.service.js";
import User from "../modules/users/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "https://smart-tutor-et-ai-learning-platform-p1j5lkyle.vercel.app"
        ],
        methods: ["GET", "POST"]
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
    socket.on("sendMessage", async (data) => {
        const { receiverId, message, senderName } = data;

        // Persist DM
        await ChatService.saveMessage({
            senderId: userId,
            senderName,
            text: message,
            receiverId,
            status: "sent"
        });

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", { ...data, senderId: userId });
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
        const room = `squad_${squadId}`;
        socket.join(room);
        console.log(`[Socket] User ${userId} joined room: ${room}`);

        // Debug: list rooms for this socket
        console.log(`[Socket] ${socket.id} rooms:`, Array.from(socket.rooms));
    });

    socket.on("send-squad-message", async (data) => {
        try {
            const { squadId, message } = data;

            // Resolve Sender from DB to ensure correct Name/Pic
            const sender = await User.findById(userId);
            const senderName = sender?.fullName || "Scholar";
            const senderPic = sender?.profilePic || "";

            // Persist Squad Message
            const savedMsg = await ChatService.saveMessage({
                senderId: userId,
                senderName,
                senderPic,
                text: message,
                squadId,
                status: "sent",
                replyTo: data.replyTo || null
            });

            console.log(`[Socket] Broadcasting verified msg from ${senderName} to squad_${squadId}`);
            io.to(`squad_${squadId}`).emit("new-squad-message", {
                ...savedMsg.toObject(),
                _id: savedMsg._id.toString(),
                replyTo: data.replyToData || null
            });
        } catch (err) {
            console.error("[Socket] send-squad-message error:", err);
        }
    });

    // --- Reactions ---
    socket.on("message-reaction", async (data) => {
        const { messageId, emoji, squadId } = data;
        try {
            const reactor = await User.findById(userId);
            const userName = reactor?.fullName || "Scholar";

            // Update in DB
            const updatedMsg = await ChatService.addReaction(messageId, {
                user: userId,
                emoji,
                userName
            });

            if (updatedMsg) {
                io.to(`squad_${squadId}`).emit("update-message", updatedMsg);
            }
        } catch (err) {
            console.error("[Socket] message-reaction error:", err);
        }
    });

    // --- Forum & Q&A Sync ---
    socket.on("new-forum-thread", (data) => {
        const { squadId, thread } = data;
        socket.to(`squad_${squadId}`).emit("forum-thread-created", thread);
    });

    socket.on("new-question", (data) => {
        const { squadId, question } = data;
        socket.to(`squad_${squadId}`).emit("question-created", question);
    });

    // Squad live session broadcast — send to each specific member
    socket.on("squad-live-start", (data) => {
        const { memberIds = [], callId, squadId, squadName, hostName, hostId } = data;
        const safeMemberIds = Array.isArray(memberIds) ? memberIds : [];

        safeMemberIds.forEach((memberId) => {
            const memberSocketId = getReceiverSocketId(memberId);
            if (memberSocketId) {
                io.to(memberSocketId).emit("squad-live-started", {
                    callId,
                    squadId,
                    squadName,
                    hostName,
                    hostId,
                });
            }
        });
        // Also broadcast to squad room (for members who joined the room socket)
        socket.to(`squad_${squadId}`).emit("squad-live-started", { callId, squadId, squadName, hostName, hostId });
    });

    // Direct (Individual) Video Call Invite
    socket.on("direct-live-invite", (data) => {
        const { inviteeId, callId, hostName, hostId } = data;
        const receiverSocketId = getReceiverSocketId(inviteeId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("direct-live-invited", {
                callId,
                hostName,
                hostId: hostId || userId
            });
        }
    });

    socket.on("squad-live-stop", (data) => {
        const { squadId } = data;
        io.to(`squad_${squadId}`).emit("squad-live-ended", { squadId });
        // Also notify members directly in case they aren't in the room
        const { memberIds = [] } = data;
        memberIds.forEach(mId => {
            const mSocketId = getReceiverSocketId(mId);
            if (mSocketId) io.to(mSocketId).emit("squad-live-ended", { squadId });
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };
