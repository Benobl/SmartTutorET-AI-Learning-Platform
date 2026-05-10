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
        type: {
            type: String,
            enum: ["assignment", "quiz", "mid_exam", "final_exam"],
            default: "assignment",
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        maxMarks: {
            type: Number,
            required: true,
            default: 10,
        },
        weight: {
            type: Number,
            default: null, // Optional, legacy field
        },
        priority: {
            type: String,
            enum: ["high", "medium", "low", null],
            default: null, // Optional, legacy field
        },
        grade: {
            type: String,
            default: "", // e.g. "9", "10", "11", "12" or "" for all grades
        },
        dueDate: {
            type: Date,
            required: true,
        },
        attachments: [{
            type: String,
        }]
    },
    { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
