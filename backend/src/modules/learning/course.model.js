import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "CourseModuleV2" }]
}, { timestamps: true });

courseSchema.index({ tutorId: 1, createdAt: -1 });

export default mongoose.model("CourseV2", courseSchema);
