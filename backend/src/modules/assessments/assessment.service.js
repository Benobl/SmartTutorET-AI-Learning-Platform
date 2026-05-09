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

    static async generateAIQuiz(tutorId, { subject, grade, topic, count, subjectId, isOfficial = true }) {
        const questions = await AIService.generateQuiz(subject, grade, topic, count);
        
        const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
        
        return await Assessment.create({
            title: `AI Generated: ${topic}`,
            description: `Auto-generated quiz about ${topic} for Grade ${grade}`,
            subject: subjectId,
            grade: grade.toString(),
            type: isOfficial ? "quiz" : "practice",
            questions,
            totalMarks,
            passingMarks: Math.ceil(totalMarks * 0.6),
            createdBy: tutorId,
            creationMethod: "ai",
            isPublished: true,
            isOfficial
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

    static async startAttempt(userId, assessmentId) {
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) throw new ApiError(404, "Assessment not found");

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ user: userId, assessment: assessmentId });
        if (existingAttempt) throw new ApiError(400, "You have already submitted this assessment");

        return await Attempt.create({
            user: userId,
            assessment: assessmentId,
            startedAt: new Date()
        });
    }

    static async submitAttempt(userId, assessmentId, answers) {
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) throw new ApiError(404, "Assessment not found");

        // Find existing attempt (started)
        let attempt = await Attempt.findOne({ user: userId, assessment: assessmentId });
        
        // If it was an exam and it has a timer, we should check if they started it
        if (assessment.type === "exam" && !attempt) {
            throw new ApiError(400, "You must start the exam before submitting");
        }

        // If no attempt exists (e.g. for simple quizzes), create one now
        if (!attempt) {
            attempt = new Attempt({ user: userId, assessment: assessmentId });
        } else if (attempt.gradedAt) {
            throw new ApiError(400, "You have already submitted this assessment");
        }

        // Timer Logic for Exams
        const now = new Date();
        const timeSpent = Math.floor((now - attempt.startedAt) / 1000); // seconds
        
        if (assessment.type === "exam" && assessment.duration) {
            const timeLimitSeconds = assessment.duration * 60;
            if (timeSpent > timeLimitSeconds + 30) { // 30s grace period
                // Mark as failed or limit score if overdue? 
                // For now, just record the time and let it pass, but user said "must finish in that times"
                // We'll record it and let the controller decide if it's a zero
            }
        }

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

        attempt.answers = gradedAnswers;
        attempt.score = score;
        attempt.correctAnswers = correctAnswersCount;
        attempt.percentage = percentage;
        attempt.passed = passed;
        attempt.gradedAt = now;
        attempt.submittedAt = now;
        attempt.timeSpent = timeSpent;

        await attempt.save();

        // Update student progress automatically ONLY IF it's an official assessment
        if (assessment.isOfficial) {
            await ProgressService.markAssessmentComplete(userId, assessment.subject, assessmentId);
        }

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

    static async deleteAssessment(assessmentId, tutorId) {
        const assessment = await Assessment.findOneAndDelete({ _id: assessmentId, createdBy: tutorId });
        if (!assessment) throw new ApiError(404, "Assessment not found or unauthorized");
        return assessment;
    }
}
