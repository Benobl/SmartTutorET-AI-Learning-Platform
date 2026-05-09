import mongoose from "mongoose";

const courseModuleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseV2", required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  contents: [{ type: mongoose.Schema.Types.ObjectId, ref: "ContentV2" }],
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizV2" }
}, { timestamps: true });

courseModuleSchema.index({ courseId: 1, order: 1 });

export default mongoose.model("CourseModuleV2", courseModuleSchema);
