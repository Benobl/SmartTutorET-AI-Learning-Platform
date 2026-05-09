import { SubjectService } from "./subject.service.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class SubjectController {
    static async createSubject(req, res, next) {
        try {
            if (req.user.role === "tutor" && req.user.tutorStatus !== "approved") {
                throw new ApiError(403, "Your tutor account is pending approval. You cannot create subjects yet.");
            }
            if (req.user.role === "student") {
                throw new ApiError(403, "Students cannot create subjects.");
            }

            const subjectData = {
                ...req.body,
                syllabusUrl: req.file ? `/uploads/syllabus/${req.file.filename}` : undefined
            };

            const subject = await SubjectService.createSubject(req.user._id, subjectData);
            res.status(201).json({ success: true, data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const updateData = { ...req.body };
            if (req.file) {
                updateData.syllabusUrl = `/uploads/syllabus/${req.file.filename}`;
                updateData.status = "pending";
            }
            const subject = await SubjectService.updateSubject(req.params.subjectId, updateData);
            res.json({ success: true, message: "Subject framework updated and resubmitted", data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await SubjectService.deleteSubject(req.params.subjectId);
            res.json({ success: true, message: "Subject deleted successfully" });
        } catch (error) {
            next(error);
        }
    }

    static async enroll(req, res, next) {
        try {
            const { subjectId } = req.params;
            const subject = await SubjectService.enrollStudent(subjectId, req.user._id);
            res.json({ success: true, message: "Enrolled successfully in " + subject.title, data: subject });
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
            const { category, grade, search, isPremium } = req.query;
            const filter = {};

            if (req.user.role !== "manager" && req.user.role !== "admin") {
                filter.$or = [
                    { status: "approved" },
                    { tutor: req.user._id }
                ];
            }

            if (category) filter.category = category;
            if (grade) filter.grade = grade;
            if (isPremium) filter.isPremium = isPremium === "true";
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }

            const subjects = await SubjectService.getAllSubjects(filter);
            res.json({ success: true, data: subjects });
        } catch (error) {
            next(error);
        }
    }

    static async getRecommendations(req, res, next) {
        try {
            const subjects = await SubjectService.getRecommended(req.user);
            res.json({ success: true, data: subjects });
        } catch (error) {
            next(error);
        }
    }

    static async getMyCourses(req, res, next) {
        try {
            const subjects = await SubjectService.getMySubjects(req.user._id, req.user.role);
            res.json({ success: true, data: subjects });
        } catch (error) {
            next(error);
        }
    }

    static async getMyStudents(req, res, next) {
        try {
            const students = await SubjectService.getTutorStudents(req.user._id);
            res.json({ success: true, data: students });
        } catch (error) {
            next(error);
        }
    }

    static async approve(req, res, next) {
        try {
            const subject = await SubjectService.updateStatus(req.params.subjectId, "approved");
            res.json({ success: true, message: "Subject approved", data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async reject(req, res, next) {
        try {
            const subject = await SubjectService.updateStatus(req.params.subjectId, "rejected");
            res.json({ success: true, message: "Subject rejected", data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async addLesson(req, res, next) {
        try {
            const subject = await SubjectService.addLesson(req.params.subjectId, req.body);
            res.json({ success: true, message: "Lesson added successfully", data: subject });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload a video file as a new lesson.
     * The video is stored at /uploads/videos/<filename>.
     * Students can only view (not download) via the served static route.
     */
    static async uploadLessonVideo(req, res, next) {
        try {
            if (!req.file) throw new ApiError(400, "No video file provided.");

            const { title, duration } = req.body;
            if (!title) throw new ApiError(400, "Lesson title is required.");

            const fileUrl = `/uploads/videos/${req.file.filename}`;
            const fileType = req.body.type || (req.file.mimetype.includes("video") ? "video" : "ppt");
            
            const lessonData = {
                title,
                videoUrl: fileType === "video" ? fileUrl : undefined,
                pptUrl: fileType === "ppt" ? fileUrl : undefined,
                exerciseUrl: ["exercise", "quiz", "exam"].includes(fileType) ? fileUrl : undefined,
                duration: duration || "15 min",
                type: fileType,
                isUploadedFile: true
            };

            const subject = await SubjectService.addLesson(req.params.subjectId, lessonData);
            res.json({ success: true, message: "Video lesson uploaded successfully", data: subject });
        } catch (error) {
            next(error);
        }
    }

    static async getLessons(req, res, next) {
        try {
            const subject = await SubjectService.getSubjectDetails(req.params.subjectId);
            if (!subject) throw new ApiError(404, "Subject not found");
            res.json({ success: true, data: subject.lessons });
        } catch (error) {
            next(error);
        }
    }

    static async autoGenerateLessons(req, res, next) {
        try {
            const subject = await SubjectService.autoGenerateLessons(req.params.subjectId);
            res.json({ success: true, message: "AI has successfully populated the curriculum", data: subject });
        } catch (error) {
            next(error);
        }
    }
}
