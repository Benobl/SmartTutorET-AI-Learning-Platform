import User from "./user.model.js";
import FriendRequest from "./friend.model.js";
import PeerQuestion from "../social/question.model.js";
import PeerAnswer from "../social/answer.model.js";
import Progress from "../progress/progress.model.js";
import Subject from "../courses/subject.model.js";
import Assessment from "../assessments/assessment.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import { upsertStreamUser } from "../../lib/stream.js";

export class UserService {
    static async onboard(userId, onboardingData) {
        const user = await User.findByIdAndUpdate(
            userId,
            { ...onboardingData, isOnboarded: true },
            { new: true }
        );

        if (!user) throw new ApiError(404, "User not found");

        // Sync with Stream
        upsertStreamUser({
            id: user._id.toString(),
            name: user.name,
            image: user.profile.avatar || "",
        }).catch(err => console.error("Stream sync error during onboarding:", err));

        return user;
    }

    static async updateProfile(userId, profileData) {
        const user = await User.findByIdAndUpdate(userId, profileData, { new: true });
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async getProfile(userId) {
        const user = await User.findById(userId).select("-password").populate("friends", "name profile.avatar");
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async sendFriendRequest(senderId, receiverId) {
        if (senderId.toString() === receiverId.toString()) {
            throw new ApiError(400, "You cannot send a friend request to yourself");
        }

        const existing = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
        if (existing) throw new ApiError(400, "Friend request already sent");

        return await FriendRequest.create({ sender: senderId, receiver: receiverId });
    }

    static async askQuestion(authorId, questionData) {
        return await PeerQuestion.create({
            ...questionData,
            authorId
        });
    }

    static async answerQuestion(authorId, questionId, content) {
        return await PeerAnswer.create({
            questionId,
            authorId,
            content
        });
    }

    static async getStudents() {
        return await User.find({ role: "student" }).select("name profile.avatar email grade");
    }

    static async getTutors() {
        return await User.find({ role: "tutor" }).select(
            "name profile email subjects documents skills availability tutorStatus isApproved createdAt"
        );
    }

    static async searchByEmail(email) {
        const user = await User.findOne({ email: email.toLowerCase() }).select("name profile.avatar email role grade");
        if (!user) throw new ApiError(404, "User not found");
        return user;
    }

    static async getStudentStats(studentId) {
        const student = await User.findById(studentId);
        if (!student) throw new ApiError(404, "Student not found");

        const progressRecords = await Progress.find({ student: studentId });
        
        const totalEnrolled = progressRecords.length;
        const avgProgress = totalEnrolled > 0 
            ? Math.round(progressRecords.reduce((acc, curr) => acc + curr.totalProgress, 0) / totalEnrolled)
            : 0;
            
        // Mocking some stats that would come from more complex aggregation or activity logs
        const streak = 12; // Example streak
        const rank = 14;   // Example rank
        const gpa = 3.8;   // Example GPA based on assessments
        
        const quizzesTaken = progressRecords.reduce((acc, curr) => acc + curr.completedAssessments.length, 0);

        return {
            avgProgress,
            totalEnrolled,
            streak,
            rank,
            gpa,
            quizzesTaken,
            points: 1250, // Gamification points
            badges: 5
        };
    }

    static async getTutorStats(tutorId) {
        const tutor = await User.findById(tutorId);
        if (!tutor) throw new ApiError(404, "Tutor not found");

        const courses = await Subject.find({ tutor: tutorId });
        const studentCount = courses.reduce((acc, curr) => acc + (curr.students?.length || 0), 0);
        
        // Mocking some stats
        const classAverage = 78;
        const pendingHomework = 5;

        return {
            courses: courses.length,
            activeStudents: studentCount,
            classAverage,
            pendingHomework,
            firstName: tutor.name.split(" ")[0]
        };
    }
}
