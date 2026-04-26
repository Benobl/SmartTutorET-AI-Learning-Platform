import mongoose from "mongoose";

const peerQuestionSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        tags: [String],
        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        downvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        squadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyGroup",
            default: null,
        },
        isResolved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const PeerQuestion = mongoose.model("PeerQuestion", peerQuestionSchema);
export default PeerQuestion;
