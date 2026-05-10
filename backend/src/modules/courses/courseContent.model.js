import mongoose from "mongoose";

const courseContentSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            enum: ["Video", "PDF", "YouTube", "Quiz", "Exercise"],
            required: true,
        },
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "categoryModel",
        },
        categoryModel: {
            type: String,
            required: true,
            enum: ["Video", "PDF", "YouTubeLink", "Quiz", "Exercise"],
        },
        order: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const CourseContent = mongoose.model("CourseContent", courseContentSchema);
export default CourseContent;
