import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        selectedAnswer: { type: String },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["submitted", "pending"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;
