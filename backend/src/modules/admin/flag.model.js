import mongoose from "mongoose";

const flagSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["Content", "User", "Abuse", "Spam", "Other"]
    },
    reason: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low"
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetModel: {
        type: String,
        required: true,
        enum: ["User", "Subject", "Lesson", "ForumPost"]
    },
    status: {
        type: String,
        enum: ["pending", "resolved", "dismissed"],
        default: "pending"
    },
    resolution: {
        note: String,
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        resolvedAt: Date
    }
}, {
    timestamps: true
});

const Flag = mongoose.model("Flag", flagSchema);
export default Flag;
