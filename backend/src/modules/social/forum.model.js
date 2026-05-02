import mongoose from "mongoose";

const forumSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Forum = mongoose.model("Forum", forumSchema);
export default Forum;
