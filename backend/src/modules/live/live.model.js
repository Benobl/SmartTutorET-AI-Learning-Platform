import mongoose from "mongoose";

const liveSessionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        roomType: {
            type: String,
            enum: ["class", "group_call"],
            default: "group_call",
        },
        recordingUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
        collection: "livesessions",
    }
);

const LiveSession = mongoose.model("LiveSession", liveSessionSchema);
export default LiveSession;
