import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        threadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
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
        parentPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    },
    {
        timestamps: true,
    }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
