import mongoose from "mongoose";

const forumSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            enum: ["general", "group", "course"],
            default: "general",
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "typeModel",
        },
        typeModel: {
            type: String,
            enum: ["StudyGroup", "Course", null],
        },
    },
    {
        timestamps: true,
    }
);

const Forum = mongoose.model("Forum", forumSchema);
export default Forum;
