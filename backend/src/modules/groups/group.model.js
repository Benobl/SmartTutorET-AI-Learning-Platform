import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        topic: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: "🧬", // Default emoji or URL
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        isLive: {
            type: Boolean,
            default: false,
        },
        sessionData: {
            type: Object,
            default: null, // Stores Stream Call ID or dynamic metadata
        },
    },
    {
        timestamps: true,
    }
);

const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);
export default StudyGroup;
