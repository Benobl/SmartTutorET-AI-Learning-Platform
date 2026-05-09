import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseV2" },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseModuleV2" },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuestionV2" }]
}, { timestamps: true });

quizSchema.index({ courseId: 1, moduleId: 1 });

export default mongoose.model("QuizV2", quizSchema);
