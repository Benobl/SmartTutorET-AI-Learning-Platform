import Assignment from "./assignment.model.js";
import AssignmentSubmission from "./assignmentSubmission.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import Subject from "../courses/subject.model.js";
import { NotificationService } from "../notifications/notification.service.js";

const toNumberGrade = (value) => {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : null;
};

const canStudentAccessSubject = (subject, studentUser) => {
    if (!subject) return false;

    const studentId = String(studentUser._id);
    const isEnrolled = (subject.students || []).some((id) => String(id) === studentId);
    if (isEnrolled) return true;

    const studentGrade = toNumberGrade(studentUser.grade);
    const subjectGrade = toNumberGrade(subject.grade);
    const hasFreeGradeAccess =
        !subject.isPremium &&
        (
            studentGrade === null ||
            subjectGrade === null ||
            studentGrade === subjectGrade
        );

    return hasFreeGradeAccess;
};

const getSubjectOrThrow = async (subjectId) => {
    const subject = await Subject.findById(subjectId).select(
        "title tutor students isPremium grade status"
    );
    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }
    return subject;
};

const enforceSubjectReadAccess = async (req, subjectId) => {
    const subject = await getSubjectOrThrow(subjectId);

    if (req.user.role === "admin" || req.user.role === "manager") {
        return subject;
    }

    if (req.user.role === "tutor") {
        if (String(subject.tutor) !== String(req.user._id)) {
            throw new ApiError(403, "Not authorized to access assignments for this subject.");
        }
        return subject;
    }

    if (req.user.role === "student") {
        if (!canStudentAccessSubject(subject, req.user)) {
            throw new ApiError(403, "You are not allowed to access assignments for this subject.");
        }
        return subject;
    }

    throw new ApiError(403, "Role is not allowed to access assignments.");
};

const normalizeAttachments = (attachments) => {
    if (!Array.isArray(attachments)) return [];
    return attachments
        .map((item) => String(item || "").trim())
        .filter(Boolean);
};

const parseAssignmentDueDate = (rawDueDate) => {
    const value = String(rawDueDate || "").trim();
    if (!value) {
        throw new ApiError(400, "dueDate is required.");
    }

    // If tutor sends a date-only value from <input type="date">, set it to end-of-day
    // so the assignment remains visible/submittable throughout that date.
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyPattern.test(value)) {
        const endOfDay = new Date(`${value}T23:59:59.999`);
        if (Number.isNaN(endOfDay.getTime())) {
            throw new ApiError(400, "Invalid dueDate format.");
        }
        return endOfDay;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new ApiError(400, "Invalid dueDate format.");
    }
    return parsed;
};

const getGradeBand = (percentage) => {
    if (typeof percentage !== "number") return null;
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
};

const buildRankMapsForAssignments = async (assignmentIds = []) => {
    const uniqueAssignmentIds = [...new Set(
        (assignmentIds || []).map((id) => String(id || "").trim()).filter(Boolean)
    )];

    const rankBySubmissionId = new Map();
    const totalsByAssignmentId = new Map();

    if (uniqueAssignmentIds.length === 0) {
        return { rankBySubmissionId, totalsByAssignmentId };
    }

    const allRows = await AssignmentSubmission.find({
        assignment: { $in: uniqueAssignmentIds },
    }).select("_id assignment marksObtained updatedAt status");

    const groupedByAssignment = new Map();
    allRows.forEach((row) => {
        const assignmentId = String(row.assignment);

        const existingTotals = totalsByAssignmentId.get(assignmentId) || {
            totalSubmissions: 0,
            totalEvaluated: 0,
        };
        existingTotals.totalSubmissions += 1;
        if (row.status === "evaluated") {
            existingTotals.totalEvaluated += 1;
        }
        totalsByAssignmentId.set(assignmentId, existingTotals);

        if (row.status !== "evaluated") return;
        if (!groupedByAssignment.has(assignmentId)) {
            groupedByAssignment.set(assignmentId, []);
        }
        groupedByAssignment.get(assignmentId).push(row);
    });

    groupedByAssignment.forEach((rows) => {
        rows.sort((a, b) => {
            const aMarks = Number(a.marksObtained ?? -Infinity);
            const bMarks = Number(b.marksObtained ?? -Infinity);
            if (bMarks !== aMarks) return bMarks - aMarks;
            const aTime = new Date(a.updatedAt).getTime();
            const bTime = new Date(b.updatedAt).getTime();
            if (aTime !== bTime) return aTime - bTime;
            return String(a._id).localeCompare(String(b._id));
        });

        let processed = 0;
        let currentRank = 0;
        let lastMarks = null;

        rows.forEach((row) => {
            processed += 1;
            const marks = Number(row.marksObtained ?? -Infinity);
            if (lastMarks === null || marks !== lastMarks) {
                currentRank = processed;
                lastMarks = marks;
            }
            rankBySubmissionId.set(String(row._id), currentRank);
        });
    });

    return { rankBySubmissionId, totalsByAssignmentId };
};

const addResultMetaToSubmission = (submission, rankBySubmissionId, totalsByAssignmentId) => {
    const raw = typeof submission?.toObject === "function" ? submission.toObject() : submission;
    const assignmentId = raw?.assignment?._id
        ? String(raw.assignment._id)
        : String(raw?.assignment || "");
    const marks = Number(raw?.marksObtained);
    const maxMarks = Number(raw?.assignment?.maxMarks || 100);
    const percentage = Number.isFinite(marks) && maxMarks > 0
        ? Math.round((marks / maxMarks) * 100)
        : null;
    const rank = rankBySubmissionId.get(String(raw?._id)) ?? null;
    const totals = totalsByAssignmentId.get(assignmentId) || {
        totalSubmissions: 0,
        totalEvaluated: 0,
    };
    const percentile = rank && totals.totalEvaluated > 0
        ? Math.round(((totals.totalEvaluated - rank + 1) / totals.totalEvaluated) * 100)
        : null;

    return {
        ...raw,
        result: {
            percentage,
            rank,
            percentile,
            totalEvaluated: totals.totalEvaluated,
            totalSubmissions: totals.totalSubmissions,
            gradeBand: getGradeBand(percentage),
        },
    };
};

export class AssignmentController {
    static async createAssignment(req, res, next) {
        try {
            const { subjectId, title, description, maxMarks, dueDate, attachments, weight, priority, grade, type } = req.body;
            
            // Verify tutor owns the subject
            const subject = await Subject.findOne({ _id: subjectId, tutor: req.user._id });
            if (!subject && req.user.role !== "admin") {
                throw new ApiError(403, "You can only create assignments for your own subjects.");
            }

            const parsedMaxMarks = Number(maxMarks);
            if (!Number.isFinite(parsedMaxMarks) || parsedMaxMarks <= 0) {
                throw new ApiError(400, "maxMarks must be a positive number.");
            }

            const parsedDueDate = parseAssignmentDueDate(dueDate);

            const assignment = await Assignment.create({
                subject: subjectId,
                tutor: req.user._id,
                title,
                type: type || "assignment",
                description,
                maxMarks,
                weight: weight ?? null,
                priority: priority ?? null,
                grade: grade || "",
                dueDate: parsedDueDate,
                attachments: normalizeAttachments(attachments)
            });

            res.status(201).json({ success: true, data: assignment });
        } catch (error) {
            next(error);
        }
    }

    static async getAssignmentsBySubject(req, res, next) {
        try {
            const { subjectId } = req.params;
            await enforceSubjectReadAccess(req, subjectId);

            const assignments = await Assignment.find({ subject: subjectId })
                .populate("subject", "title grade")
                .sort({ createdAt: -1 });

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

            if (
                assignment.tutor.toString() !== req.user._id.toString() &&
                req.user.role !== "admin" &&
                req.user.role !== "manager"
            ) {
                throw new ApiError(403, "Not authorized to view submissions for this assignment.");
            }

            const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
                .populate("student", "name email grade profile.avatar")
                .populate("assignment", "title maxMarks")
                .sort({ createdAt: -1 });

            const { rankBySubmissionId, totalsByAssignmentId } = await buildRankMapsForAssignments([
                assignmentId,
            ]);
            const withResults = submissions.map((submission) =>
                addResultMetaToSubmission(submission, rankBySubmissionId, totalsByAssignmentId)
            );

            res.json({ success: true, data: withResults });
        } catch (error) {
            next(error);
        }
    }

    static async evaluateSubmission(req, res, next) {
        try {
            const { submissionId } = req.params;
            const { marksObtained, feedback = "" } = req.body;

            const submission = await AssignmentSubmission.findById(submissionId).populate("assignment");
            if (!submission) throw new ApiError(404, "Submission not found");

            if (
                submission.assignment.tutor.toString() !== req.user._id.toString() &&
                req.user.role !== "admin" &&
                req.user.role !== "manager"
            ) {
                throw new ApiError(403, "Not authorized to evaluate this submission.");
            }

            const max = submission.assignment.maxMarks ?? 100;
            const parsedMarks = Number(marksObtained);
            if (!Number.isFinite(parsedMarks) || parsedMarks < 0 || parsedMarks > max) {
                throw new ApiError(400, `Marks must be between 0 and ${max}.`);
            }

            submission.marksObtained = parsedMarks;
            submission.feedback = String(feedback || "").trim();
            submission.status = "evaluated";
            await submission.save();

            const { rankBySubmissionId, totalsByAssignmentId } = await buildRankMapsForAssignments([
                submission.assignment._id,
            ]);
            const refreshed = await AssignmentSubmission.findById(submission._id).populate(
                "assignment",
                "title maxMarks"
            );
            const withResult = addResultMetaToSubmission(
                refreshed,
                rankBySubmissionId,
                totalsByAssignmentId
            );

            res.json({ success: true, data: withResult });
        } catch (error) {
            next(error);
        }
    }

    static async submitAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const { content = "", attachments } = req.body;

            const assignment = await Assignment.findById(assignmentId).populate(
                "subject",
                "students isPremium grade status"
            );
            if (!assignment) throw new ApiError(404, "Assignment not found");

            if (!canStudentAccessSubject(assignment.subject, req.user)) {
                throw new ApiError(403, "You are not enrolled in or eligible for this subject.");
            }

            if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
                throw new ApiError(400, "Deadline has passed. Submission is closed.");
            }

            const normalizedContent = String(content || "").trim();
            const normalizedAttachments = normalizeAttachments(attachments);
            if (!normalizedContent && normalizedAttachments.length === 0) {
                throw new ApiError(400, "Please provide text content or at least one attachment.");
            }

            let submission = await AssignmentSubmission.findOne({
                assignment: assignmentId,
                student: req.user._id,
            });

            if (submission) {
                if (submission.status === "evaluated") {
                    throw new ApiError(400, "Cannot modify an already evaluated assignment.");
                }
                submission.content = normalizedContent;
                submission.attachments = normalizedAttachments;
                await submission.save();
            } else {
                submission = await AssignmentSubmission.create({
                    assignment: assignmentId,
                    student: req.user._id,
                    content: normalizedContent,
                    attachments: normalizedAttachments,
                });
            }

            res.json({ success: true, data: submission });
        } catch (error) {
            next(error);
        }
    }

    static async getMyMarks(req, res, next) {
        try {
            const submissions = await AssignmentSubmission.find({
                student: req.user._id,
                status: "evaluated",
            })
                .populate({
                    path: "assignment",
                    populate: { path: "subject", select: "title grade" },
                })
                .sort({ updatedAt: -1 });

            const assignmentIds = submissions.map((submission) =>
                String(submission.assignment?._id || submission.assignment || "")
            );
            const { rankBySubmissionId, totalsByAssignmentId } = await buildRankMapsForAssignments(
                assignmentIds
            );
            const withResults = submissions.map((submission) =>
                addResultMetaToSubmission(submission, rankBySubmissionId, totalsByAssignmentId)
            );

            res.json({ success: true, data: withResults });
        } catch (error) {
            next(error);
        }
    }

    static async getMySubmissionsForSubject(req, res, next) {
        try {
            const { subjectId } = req.params;
            await enforceSubjectReadAccess(req, subjectId);

            const assignments = await Assignment.find({ subject: subjectId }).select("_id");
            const assignmentIds = assignments.map((assignment) => assignment._id);

            const submissions = await AssignmentSubmission.find({
                student: req.user._id,
                assignment: { $in: assignmentIds },
            })
                .populate("assignment", "title maxMarks")
                .sort({ createdAt: -1 });

            const { rankBySubmissionId, totalsByAssignmentId } = await buildRankMapsForAssignments(
                assignmentIds
            );
            const withResults = submissions.map((submission) =>
                addResultMetaToSubmission(submission, rankBySubmissionId, totalsByAssignmentId)
            );

            res.json({ success: true, data: withResults });
        } catch (error) {
            next(error);
        }
    }

    static async getLeaderboard(req, res, next) {
        try {
            const { grade } = req.query;
            if (!grade) throw new ApiError(400, "Grade is required for leaderboard");

            const leaderboard = await AssignmentSubmission.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "student",
                        foreignField: "_id",
                        as: "studentInfo"
                    }
                },
                { $unwind: "$studentInfo" },
                { $match: { "studentInfo.grade": grade, marksObtained: { $ne: null } } },
                {
                    $group: {
                        _id: "$student",
                        totalMarks: { $sum: "$marksObtained" },
                        studentName: { $first: "$studentInfo.name" },
                        avatar: { $first: "$studentInfo.profile.avatar" }
                    }
                },
                { $sort: { totalMarks: -1 } },
                { $limit: 10 }
            ]);

            res.json({ success: true, data: leaderboard });
        } catch (error) {
            next(error);
        }
    }

    static async getStudentGrades(req, res, next) {
        try {
            const submissions = await AssignmentSubmission.find({ 
                student: req.user._id, 
                marksObtained: { $ne: null } 
            }).populate({
                path: "assignment",
                populate: { path: "subject", select: "title" }
            });

            const report = {};
            submissions.forEach(sub => {
                if (!sub.assignment || !sub.assignment.subject) return;
                const subjectTitle = sub.assignment.subject.title;
                const type = sub.assignment.type || "assignment";

                if (!report[subjectTitle]) {
                    report[subjectTitle] = {
                        total: 0,
                        breakdown: { assignment: 0, quiz: 0, mid_exam: 0, final_exam: 0 }
                    };
                }

                report[subjectTitle].breakdown[type] = (report[subjectTitle].breakdown[type] || 0) + sub.marksObtained;
                report[subjectTitle].total += sub.marksObtained;
            });

            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }
}
