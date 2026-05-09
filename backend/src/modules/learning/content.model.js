import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseModuleV2", required: true },
  type: { type: String, enum: ["video", "pdf", "notes", "resource"], required: true },
  url: { type: String },
  text: { type: String },
  title: { type: String, required: true }
}, { timestamps: true });

contentSchema.index({ moduleId: 1, type: 1 });

export default mongoose.model("ContentV2", contentSchema);
