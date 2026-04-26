import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        senderPic: {
            type: String,
            default: "",
        },
        text: {
            type: String,
            required: true,
        },
        squadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyGroup",
            default: null, // If null, it's a direct message
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // Required if squadId is null (Direct Message)
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent",
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatMessage",
            default: null,
        },
        reactions: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                emoji: String,
                userName: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for faster lookups
chatMessageSchema.index({ squadId: 1, createdAt: 1 });
chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
