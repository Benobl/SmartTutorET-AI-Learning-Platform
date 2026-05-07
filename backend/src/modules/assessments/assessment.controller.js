import { AssessmentService } from "./assessment.service.js";

export class AssessmentController {
    static async create(req, res, next) {
        try {
            const assessment = await AssessmentService.createAssessment(req.user._id, req.body);
            res.status(201).json({ success: true, data: assessment });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const { subject, type, grade, stream } = req.query;
            const filters = {};
            
            if (subject) filters.subject = subject;
            if (type) filters.type = type;

            // Students only see published assessments for their grade/stream
            if (req.user.role === "student") {
                filters.isPublished = true;
                
                // If student has a grade, filter by it (or 'General')
                if (req.user.grade) {
                    filters.$or = [
                        { grade: req.user.grade },
                        { grade: "General" }
                    ];
                }

                // If grade 11/12 and has stream, filter by it
                if (req.user.stream && ["11", "12"].includes(req.user.grade)) {
                    filters.stream = { $in: [req.user.stream, "Common"] };
                }
            } else {
                // Tutors/Admins can filter by grade explicitly via query
                if (grade) filters.grade = grade;
                if (stream) filters.stream = stream;
            }

            const assessments = await AssessmentService.getAssessments(filters);
            res.json({ success: true, data: assessments });
        } catch (error) {
            next(error);
        }
    }

    static async generateAI(req, res, next) {
        try {
            const assessment = await AssessmentService.generateAIQuiz(req.user._id, req.body);
            res.status(201).json({ success: true, message: "AI Quiz generated successfully", data: assessment });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const assessment = await AssessmentService.getAssessmentById(req.params.id, req.user.role);
            res.json({ success: true, data: assessment });
        } catch (error) {
            next(error);
        }
    }

    static async submit(req, res, next) {
        try {
            const { answers } = req.body;
            const result = await AssessmentService.submitAttempt(req.user._id, req.params.id, answers);
            res.json({ 
                success: true, 
                message: "Assessment submitted successfully", 
                data: result 
            });
        } catch (error) {
            next(error);
        }
    }

    static async getSubmissions(req, res, next) {
        try {
            const { assessment, student } = req.query;
            const filters = {};
            if (assessment) filters.assessment = assessment;
            if (student) filters.user = student;

            // Students only see their own submissions
            if (req.user.role === "student") {
                filters.user = req.user._id;
            }

            const submissions = await AssessmentService.getSubmissions(filters);
            res.json({ success: true, data: submissions });
        } catch (error) {
            next(error);
        }
    }

    static async publish(req, res, next) {
        try {
            const assessment = await AssessmentService.publishAssessment(req.params.id, req.user._id);
            res.json({ success: true, message: "Assessment published successfully", data: assessment });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            await AssessmentService.deleteAssessment(req.params.id, req.user._id);
            res.json({ success: true, message: "Assessment deleted successfully" });
        } catch (error) {
            next(error);
        }
    }
}
