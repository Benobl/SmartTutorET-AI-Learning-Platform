import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    price: { type: Number, default: 0 },
    category: { type: String },
}, { timestamps: true, collection: "subjects" });

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
