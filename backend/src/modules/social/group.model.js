import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: false,
        },
        topic: {
            type: String,
            default: "General",
        },
        avatar: {
            type: String,
            default: "🧬",
        },
        isLive: {
            type: Boolean,
            default: false,
        },
        sessionData: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "studygroups",
    }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;

