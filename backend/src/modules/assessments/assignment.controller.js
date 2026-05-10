import Assignment from "./assignment.model.js";
import AssignmentSubmission from "./assignmentSubmission.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import Subject from "../courses/subject.model.js";

export class AssignmentController {
    // ── Tutor Methods ──

    static async createAssignment(req, res, next) {
        try {
            const { subjectId, title, description, maxMarks, weight, dueDate, attachments } = req.body;
            
            // Verify tutor owns the subject
            const subject = await Subject.findOne({ _id: subjectId, tutor: req.user._id });
            if (!subject && req.user.role !== "admin") {
                throw new ApiError(403, "You can only create assignments for your own subjects.");
            }

            const assignment = await Assignment.create({
                subject: subjectId,
                tutor: req.user._id,
                title,
                description,
                maxMarks,
                weight: weight || 10,
                dueDate,
                attachments: attachments || []
            });

            // Notify enrolled students
            const { NotificationService } = await import("../notifications/notification.service.js");
            await NotificationService.notifyEnrolledStudents(
                subject, 
                `New assignment posted for ${subject.title}: "${title}". Due on ${new Date(dueDate).toLocaleDateString()}.`,
                "new_assignment"
            );

            res.status(201).json({ success: true, data: assignment });
        } catch (error) {
            next(error);
        }
    }

    static async getAssignmentsBySubject(req, res, next) {
        try {
            const { subjectId } = req.params;
            const assignments = await Assignment.find({ subject: subjectId }).sort({ createdAt: -1 });
            res.json({ success: true, data: assignments });
        } catch (error) {
            next(error);
        }
    }

    static async getAssignmentSubmissions(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) throw new ApiError(404, "Assignment not found");

            if (assignment.tutor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
                throw new ApiError(403, "Not authorized to view submissions for this assignment.");
            }

            const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
                .populate("student", "name email profile.avatar")
                .sort({ createdAt: -1 });

            res.json({ success: true, data: submissions });
        } catch (error) {
            next(error);
        }
    }

    static async evaluateSubmission(req, res, next) {
        try {
            const { submissionId } = req.params;
            const { marksObtained, feedback } = req.body;

            const submission = await AssignmentSubmission.findById(submissionId).populate("assignment");
            if (!submission) throw new ApiError(404, "Submission not found");

            if (submission.assignment.tutor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
                throw new ApiError(403, "Not authorized to evaluate this submission.");
            }

            submission.marksObtained = marksObtained;
            submission.feedback = feedback;
            submission.status = "evaluated";
            await submission.save();

            res.json({ success: true, data: submission });
        } catch (error) {
            next(error);
        }
    }

    // ── Student Methods ──

    static async submitAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const { content, attachments } = req.body;

            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) throw new ApiError(404, "Assignment not found");

            // Verify student is enrolled in the subject (or free course logic)
            // For now, we trust the frontend check, but we could add stricter DB checks.

            // Check if already submitted
            let submission = await AssignmentSubmission.findOne({ assignment: assignmentId, student: req.user._id });
            
            if (submission) {
                // Update existing submission if not evaluated yet
                if (submission.status === "evaluated") {
                    throw new ApiError(400, "Cannot modify an already evaluated assignment.");
                }
                submission.content = content;
                submission.attachments = attachments || [];
                await submission.save();
            } else {
                // Create new
                submission = await AssignmentSubmission.create({
                    assignment: assignmentId,
                    student: req.user._id,
                    content,
                    attachments: attachments || []
                });
            }

            res.json({ success: true, data: submission });
        } catch (error) {
            next(error);
        }
    }

    static async getMyMarks(req, res, next) {
        try {
            // Get all evaluated submissions for the student
            const submissions = await AssignmentSubmission.find({ 
                student: req.user._id,
                status: "evaluated" 
            }).populate({
                path: "assignment",
                populate: { path: "subject", select: "title" }
            }).sort({ updatedAt: -1 });

            res.json({ success: true, data: submissions });
        } catch (error) {
            next(error);
        }
    }

    static async getMySubmissionsForSubject(req, res, next) {
        try {
            const { subjectId } = req.params;
            const assignments = await Assignment.find({ subject: subjectId }).select("_id");
            const assignmentIds = assignments.map(a => a._id);

            const submissions = await AssignmentSubmission.find({
                student: req.user._id,
                assignment: { $in: assignmentIds }
            });

            res.json({ success: true, data: submissions });
        } catch (error) {
            next(error);
        }
    }
}
