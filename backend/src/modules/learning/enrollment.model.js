import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseV2", required: true, index: true },
  },
  { timestamps: true },
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("EnrollmentV2", enrollmentSchema);
