import mongoose from "mongoose";

const peerAnswerSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PeerQuestion",
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isAccepted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const PeerAnswer = mongoose.model("PeerAnswer", peerAnswerSchema);
export default PeerAnswer;
