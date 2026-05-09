import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
    {
        subject: {
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
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        maxMarks: {
            type: Number,
            required: true,
            default: 100,
        },
        priority: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium",
        },
        dueDate: {
            type: Date,
            required: true,
        },
        attachments: [{
            type: String, // URLs to files
        }]
    },
    { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
