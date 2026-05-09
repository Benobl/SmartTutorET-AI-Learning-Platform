import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "AttemptV2", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionV2", required: true },
  studentAnswer: { type: String, required: true },
  isCorrect: { type: Boolean },
  marksAwarded: { type: Number, default: 0 },
  tutorFeedback: { type: String, default: "" },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

submissionSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export default mongoose.model("SubmissionV2", submissionSchema);
