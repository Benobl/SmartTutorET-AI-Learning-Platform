import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: { type: String, enum: ["image", "pdf"] },
        url: String,
        name: String
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatSessionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        subject: {
            type: String,
            required: true,
            index: true
        },
        title: {
            type: String,
            default: "New Tutoring Session"
        },
        messages: [messageSchema],
        memory: {
            weakTopics: [String],
            strengths: [String],
            lastConceptExplored: String
        },
        isArchived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Index for quick history lookup
chatSessionSchema.index({ student: 1, subject: 1, updatedAt: -1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
export default ChatSession;
