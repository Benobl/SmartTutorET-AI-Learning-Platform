import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseV2", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizV2" },
  score: { type: Number, required: true },
  grade: { type: String, enum: ["A", "B", "C", "D", "F"] },
  feedback: { type: String },
  rankPosition: { type: Number }
}, { timestamps: true });

resultSchema.index({ studentId: 1, courseId: 1, quizId: 1 }, { unique: true });
resultSchema.index({ courseId: 1, rankPosition: 1 });

export default mongoose.model("ResultV2", resultSchema);
