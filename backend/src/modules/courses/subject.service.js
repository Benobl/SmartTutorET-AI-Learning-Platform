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
    static async getAllSubjects() {
        return await Subject.find({}).populate("tutor", "name profile.avatar");
    }
}
