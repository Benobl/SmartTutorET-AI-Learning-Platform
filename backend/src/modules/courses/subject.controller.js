import { SubjectService } from "./subject.service.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class SubjectController {
    static async createSubject(req, res, next) {
        try {
            if (req.user.role !== "tutor" && req.user.role !== "admin") {
                throw new ApiError(403, "Only tutors and admins can create subjects");
            }
            const subject = await SubjectService.createSubject(req.user._id, req.body);
            res.status(201).json({ success: true, data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async enroll(req, res, next) {
        try {
            const { subjectId } = req.params;
            const subject = await SubjectService.enrollStudent(subjectId, req.user._id);
            res.json({ success: true, message: "Enrolled successfully", data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async getSubject(req, res, next) {
        try {
            const subject = await SubjectService.getSubjectDetails(req.params.subjectId);
            if (!subject) throw new ApiError(404, "Subject not found");
            res.json({ success: true, data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const subjects = await SubjectService.getAllSubjects();
            res.json({ success: true, data: subjects });
        } catch (error) {
            next(error);
        }
    }
}
