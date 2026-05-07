import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: false, // Optional for "General" quizzes
    },
    grade: {
      type: String,
      enum: ["9", "10", "11", "12", "General"],
      default: "General",
    },
    stream: {
      type: String,
      enum: ["Natural Science", "Social Science", "Common"],
      default: "Common",
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["quiz", "exam", "practice"],
      required: true,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
        marks: { type: Number, default: 1 },
      },
    ],
    duration: {
      type: Number, // in minutes
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creationMethod: {
      type: String,
      enum: ["ai", "manual", "document"],
      default: "manual",
    },
    documentUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
