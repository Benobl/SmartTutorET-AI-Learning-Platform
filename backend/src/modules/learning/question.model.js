import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizV2", required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ["mcq", "short_answer"], required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 }
}, { timestamps: true });

questionSchema.index({ quizId: 1 });

export default mongoose.model("QuestionV2", questionSchema);
