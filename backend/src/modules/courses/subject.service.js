import Subject from "./subject.model.js";
import LiveSession from "../live/live.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class SubjectService {
    static async createSubject(tutor, subjectData) {
        return await Subject.create({
            ...subjectData,
            tutor
        });
    }

    static async enrollStudent(subjectId, studentId) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");

        if (subject.status !== "approved") {
            throw new ApiError(400, "This subject is pending review and cannot accept enrollments yet.");
        }

        if (subject.students.some(s => s.toString() === studentId.toString())) {
            throw new ApiError(400, "Student already enrolled in this subject");
        }

        subject.students.push(studentId);
        await subject.save();
        return subject;
    }

    static async getSubjectDetails(subjectId) {
        return await Subject.findById(subjectId).populate("tutor", "name email profile.avatar").populate("students", "name");
    }

    static async createLiveSession(subject, sessionData) {
        return await LiveSession.create({
            ...sessionData,
            subject
        });
    }
    static async getAllSubjects(query = {}) {
        return await Subject.find(query).populate("tutor", "name profile.avatar");
    }

    static async updateSubject(subjectId, updates) {
        const subject = await Subject.findByIdAndUpdate(subjectId, updates, { new: true });
        if (!subject) throw new ApiError(404, "Subject not found");
        return subject;
    }

    static async deleteSubject(subjectId) {
        const subject = await Subject.findByIdAndDelete(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");
        return subject;
    }

    static async getRecommended(user) {
        const query = { status: "approved" };
        
        if (user.grade) {
            query.grade = user.grade;
        }
        
        // Return premium and common subjects for their grade
        return await Subject.find(query)
            .sort({ isPremium: -1, createdAt: -1 })
            .limit(10)
            .populate("tutor", "name profile.avatar");
    }

    static async getMySubjects(userId, role) {
        if (role === "student") {
            return await Subject.find({ students: userId }).populate("tutor", "name profile.avatar");
        } else if (role === "tutor") {
            return await Subject.find({ tutor: userId }).populate("tutor", "name profile.avatar");
        }
        return [];
    }
}
