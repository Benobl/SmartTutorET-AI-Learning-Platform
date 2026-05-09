import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizV2", required: true },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" }
}, { timestamps: true });

attemptSchema.index({ studentId: 1, quizId: 1, createdAt: -1 });

export default mongoose.model("AttemptV2", attemptSchema);
