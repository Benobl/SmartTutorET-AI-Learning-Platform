import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [String],
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    type: { type: String, enum: ["multiple-choice", "true-false", "short-answer"], default: "multiple-choice" }
});

const quizSchema = new mongoose.Schema(
    {
        questions: [questionSchema],
        timeLimit: {
            type: Number, // in minutes
            default: 15,
        },
        passingScore: {
            type: Number,
            default: 70, // percentage
        }
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
