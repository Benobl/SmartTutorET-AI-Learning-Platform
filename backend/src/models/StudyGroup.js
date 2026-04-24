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
    },
    {
        timestamps: true,
    }
);

const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);
export default StudyGroup;
