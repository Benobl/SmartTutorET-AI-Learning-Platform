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

        const mongoose = (await import("mongoose")).default;
        const tid = mongoose.Types.ObjectId.isValid(tutorId) ? new mongoose.Types.ObjectId(tutorId) : tutorId;
        const courses = await Subject.find({ tutor: tid });
        
        // Count students explicitly enrolled + students in the tutor's grade who get free common subjects
        const tutorsGrades = Array.from(new Set(courses.flatMap(c => [c.grade, String(c.grade)])));
        const studentsInGrades = await User.find({ 
            role: "student", 
            grade: { $in: tutorsGrades } 
        });
        
        const studentCount = studentsInGrades.length;
        
        // Calculate pending submissions
        const Assignment = (await import("../assessments/assignment.model.js")).default;
        const AssignmentSubmission = (await import("../assessments/assignmentSubmission.model.js")).default;
        
        const assignments = await Assignment.find({ tutor: tutorId });
        const assignmentIds = assignments.map(a => a._id);
        
        const pendingHomework = await AssignmentSubmission.countDocuments({
            assignment: { $in: assignmentIds },
            status: "pending"
        });

        // Calculate class average from evaluated submissions
        const evaluatedSubmissions = await AssignmentSubmission.find({
            assignment: { $in: assignmentIds },
            status: "evaluated"
        });

        let classAverage = 0;
        if (evaluatedSubmissions.length > 0) {
            const totalMarks = evaluatedSubmissions.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
            const totalMax = evaluatedSubmissions.reduce((acc, curr) => {
                const assign = assignments.find(a => a._id.toString() === curr.assignment.toString());
                return acc + (assign?.maxMarks || 100);
            }, 0);
            classAverage = Math.round((totalMarks / totalMax) * 100);
        } else {
            classAverage = 85; // Default for new courses
        }

        return {
            courses: courses.length,
            activeStudents: studentCount,
            classAverage,
            pendingHomework,
            firstName: tutor.name.split(" ")[0]
        };
    }
}
