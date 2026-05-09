import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    price: { type: Number, default: 0 },
    category: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    grade: { type: Number, enum: [9, 10, 11, 12], default: 9 },
    isPremium: { type: Boolean, default: false },
    stream: { type: String, enum: ["Natural Science", "Social Science", "Common"], default: "Common" },
    semester: { type: String, enum: ["1", "2", "Full Year"], default: "Full Year" },
    roadmap: {
        semester1: {
            chapters: [String],
            midTermDate: { type: String },
            finalDate: { type: String }
        },
        semester2: {
            chapters: [String],
            midTermDate: { type: String },
            finalDate: { type: String }
        }
    },
    syllabusUrl: { type: String },
    managerFeedback: { type: String },
    startDate: { type: Date },
    isLive: { type: Boolean, default: false },
    lessons: [{
        title: { type: String, required: true },
        duration: { type: String, default: "15 min" },
        type: { type: String, enum: ["video", "exercise", "quiz", "ppt"], default: "video" },
        videoUrl: { type: String },
        pptUrl: { type: String },
        exerciseUrl: { type: String },
        content: { type: String }, // For text-based exercises or descriptions
        completed: { type: Boolean, default: false }
    }]
}, { timestamps: true, collection: "subjects" });

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
