import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    completedAssessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
