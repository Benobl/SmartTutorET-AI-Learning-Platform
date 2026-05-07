import Assessment from "./assessment.model.js";
import Attempt from "./attempt.model.js";
import Subject from "../courses/subject.model.js";
import { AIService } from "../ai/ai.service.js";
import { ProgressService } from "../progress/progress.service.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class AssessmentService {
    static async createAssessment(tutorId, data) {
        // If subject is provided, verify it exists
        if (data.subject) {
            const subject = await Subject.findById(data.subject);
            if (!subject) throw new ApiError(404, "Subject not found");
            
            // Auto-fill grade/stream from subject if not provided
            data.grade = data.grade || subject.grade.toString();
            data.stream = data.stream || subject.stream;
        }

        // Calculate total marks from questions
        const totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

        return await Assessment.create({
            ...data,
            totalMarks,
            createdBy: tutorId
        });
    }

    static async generateAIQuiz(tutorId, { subject, grade, topic, count, subjectId }) {
        const questions = await AIService.generateQuiz(subject, grade, topic, count);
        
        const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
        
        return await Assessment.create({
            title: `AI Generated: ${topic}`,
            description: `Auto-generated quiz about ${topic} for Grade ${grade}`,
            subject: subjectId,
            grade: grade.toString(),
            type: "quiz",
            questions,
            totalMarks,
            passingMarks: Math.ceil(totalMarks * 0.6),
            createdBy: tutorId,
            creationMethod: "ai",
            isPublished: true
        });
    }

    static async getAssessments(filters = {}) {
        return await Assessment.find(filters)
            .populate("subject", "title")
            .populate("createdBy", "name profile.avatar")
            .sort({ createdAt: -1 });
    }

    static async getAssessmentById(id, userRole) {
        const assessment = await Assessment.findById(id)
            .populate("subject", "title")
            .populate("createdBy", "name profile.avatar");

        if (!assessment) throw new ApiError(404, "Assessment not found");

        // If student, hide correct answers
        if (userRole === "student") {
            const studentView = assessment.toObject();
            studentView.questions = studentView.questions.map(q => ({
                ...q,
                correctAnswer: undefined
            }));
            return studentView;
        }

        return assessment;
    }

    static async submitAttempt(userId, assessmentId, answers) {
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) throw new ApiError(404, "Assessment not found");

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ user: userId, assessment: assessmentId });
        if (existingAttempt) throw new ApiError(400, "You have already submitted this assessment");

        // Auto-grading logic
        let score = 0;
        let correctAnswersCount = 0;

        const gradedAnswers = answers.map((userAnswer) => {
            const question = assessment.questions.find(q => q._id.toString() === userAnswer.questionId.toString());
            if (!question) return userAnswer;

            const isCorrect = userAnswer.selectedAnswer === question.correctAnswer;
            if (isCorrect) {
                score += (question.marks || 1);
                correctAnswersCount++;
            }

            return {
                ...userAnswer,
                isCorrect,
                pointsEarned: isCorrect ? (question.marks || 1) : 0
            };
        });

        const percentage = Math.round((score / assessment.totalMarks) * 100);
        const passed = percentage >= (assessment.passingMarks || 60);

        const attempt = await Attempt.create({
            user: userId,
            assessment: assessmentId,
            answers: gradedAnswers,
            score,
            correctAnswers: correctAnswersCount,
            percentage,
            passed,
            gradedAt: new Date()
        });

        // Update student progress automatically
        await ProgressService.markAssessmentComplete(userId, assessment.subject, assessmentId);

        return attempt;
    }

    static async getSubmissions(filters = {}) {
        return await Attempt.find(filters)
            .populate("assessment", "title type totalMarks")
            .populate("user", "name email profile.avatar")
            .sort({ createdAt: -1 });
    }

    static async publishAssessment(assessmentId, tutorId) {
        const assessment = await Assessment.findOneAndUpdate(
            { _id: assessmentId, createdBy: tutorId },
            { isPublished: true },
            { new: true }
        );
        if (!assessment) throw new ApiError(404, "Assessment not found or unauthorized");
        return assessment;
    }
}
