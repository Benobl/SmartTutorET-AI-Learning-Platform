import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
    {
        forumId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Forum",
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        tags: [String],
        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Thread = mongoose.model("Thread", threadSchema);
export default Thread;
