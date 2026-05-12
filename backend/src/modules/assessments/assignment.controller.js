import Assignment from "./assignment.model.js";
import AssignmentSubmission from "./assignmentSubmission.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import Subject from "../courses/subject.model.js";
import { NotificationService } from "../notifications/notification.service.js";
import { awardXP } from "../gamification/gamification.controller.js";
import { ProgressService } from "../progress/progress.service.js";
import Enrollment from "../learning/enrollment.model.js";
import { io, getReceiverSocketId } from "../../lib/socket.js";

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
                .populate({
                    path: "student",
                    select: "name email grade profile.avatar"
                })
                .populate("assignment", "title maxMarks")
                .sort({ createdAt: -1 });

            // Filter out submissions with deleted/missing students if needed, 
            // or just ensure frontend doesn't crash. 
            // We'll keep them but log a warning if student is missing.
            submissions.forEach(s => {
                if (!s.student) {
                    console.warn(`[Assignment] Submission ${s._id} has a missing student reference.`);
                }
            });

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

            console.log(`[Grading] Tutor ${req.user.email} is grading submission ${submissionId} with marks ${marksObtained}`);

            const submission = await AssignmentSubmission.findById(submissionId)
                .populate({
                    path: "assignment",
                    populate: { path: "subject" }
                });

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

            // Update Progress Model
            try {
                await ProgressService.updateProgressFromAssignment(
                    submission.student,
                    submission.assignment.subject._id,
                    submission.assignment._id
                );
                console.log(`[Grading] Successfully synced progress for student ${submission.student} in subject ${submission.assignment.subject.title}`);
                
                // Emit socket event for real-time refresh
                const studentSocketId = getReceiverSocketId(String(submission.student));
                if (studentSocketId) {
                    io.to(studentSocketId).emit("grade-updated", {
                        subjectId: submission.assignment.subject._id,
                        assignmentId: submission.assignment._id,
                        marks: parsedMarks
                    });
                    console.log(`[Grading] Emitted real-time update to student socket ${studentSocketId}`);
                }
            } catch (progError) {
                console.error("[Grading] Failed to update progress model or emit socket:", progError);
                // We don't throw here to avoid failing the whole request if progress sync fails
            }

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

                // Award XP for first-time submission
                await awardXP({
                    user: req.user,
                    body: { amount: 100, reason: "assignment", metadata: { assignmentId } }
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
            const studentId = req.user._id;
            const studentGrade = req.user.grade;

            console.log(`[Grades] Fetching report for Student: ${studentId}, Grade: ${studentGrade}`);

            // 1. Identify all target subjects (Enrollments, Array, Free)
            const enrollments = await Enrollment.find({ studentId }).select("courseId");
            const enrolledCourseIds = enrollments.map(e => e.courseId.toString());
            
            const subjectsByArray = await Subject.find({ students: studentId }).select("_id");
            const arraySubjectIds = subjectsByArray.map(s => s._id.toString());

            const freeSubjectQuery = {
                isPremium: false,
                $or: [{ status: "approved" }, { status: { $exists: false } }]
            };
            if (studentGrade) freeSubjectQuery.grade = studentGrade;
            const freeSubjects = await Subject.find(freeSubjectQuery).select("_id");
            const freeSubjectIds = freeSubjects.map(s => s._id.toString());

            const allTargetSubjectIds = [...new Set([
                ...enrolledCourseIds,
                ...arraySubjectIds,
                ...freeSubjectIds
            ])];

            console.log(`[Grades] Target Subjects Count: ${allTargetSubjectIds.length}`);

            // 2. Fetch all relevant subjects and assignments
            const enrolledSubjects = await Subject.find({ _id: { $in: allTargetSubjectIds } });
            const allAssignments = await Assignment.find({ 
                subject: { $in: allTargetSubjectIds } 
            }).populate("subject", "title");

            // 3. Fetch student submissions
            const submissions = await AssignmentSubmission.find({ 
                student: studentId 
            }).populate({
                path: "assignment",
                populate: { path: "subject", select: "title" }
            });

            // 4. Initialize report using Subject IDs as primary keys
            // We use an object keyed by ID, then convert to array for frontend
            const reportMap = {};

            enrolledSubjects.forEach(sub => {
                reportMap[sub._id.toString()] = {
                    subjectId: sub._id,
                    subject: sub.title,
                    totalObtained: 0,
                    totalPossible: 0,
                    breakdown: {
                        assignment: { obtained: 0, max: 0, count: 0, pending: 0 },
                        quiz: { obtained: 0, max: 0, count: 0, pending: 0 },
                        mid_exam: { obtained: 0, max: 0, count: 0, pending: 0 },
                        final_exam: { obtained: 0, max: 0, count: 0, pending: 0 }
                    },
                    status: "in_progress",
                    recentFeedback: []
                };
            });

            // 5. Add all assignments to the report (even if not submitted)
            allAssignments.forEach(asm => {
                if (!asm.subject) return;
                const subId = asm.subject._id.toString();
                const type = asm.type || "assignment";

                if (reportMap[subId]) {
                    if (reportMap[subId].breakdown[type]) {
                        reportMap[subId].breakdown[type].max += asm.maxMarks;
                        reportMap[subId].breakdown[type].count += 1;
                        reportMap[subId].totalPossible += asm.maxMarks;
                    }
                }
            });

            // 6. Map submissions to the report
            submissions.forEach(sub => {
                if (!sub.assignment || !sub.assignment.subject) {
                    console.warn(`[Grades] Submission ${sub._id} has missing assignment/subject reference`);
                    return;
                }

                const subId = sub.assignment.subject._id.toString();
                let type = sub.assignment.type || "assignment";
                if (!["assignment", "quiz", "mid_exam", "final_exam"].includes(type)) {
                    type = "assignment";
                }

                if (!reportMap[subId]) {
                    // This happens if a student submitted for a course they are no longer "enrolled" in
                    // We add it to the report anyway so grades aren't lost
                    reportMap[subId] = {
                        subjectId: sub.assignment.subject._id,
                        subject: sub.assignment.subject.title,
                        totalObtained: 0,
                        totalPossible: 0,
                        breakdown: {
                            assignment: { obtained: 0, max: 0, count: 0, pending: 0 },
                            quiz: { obtained: 0, max: 0, count: 0, pending: 0 },
                            mid_exam: { obtained: 0, max: 0, count: 0, pending: 0 },
                            final_exam: { obtained: 0, max: 0, count: 0, pending: 0 }
                        },
                        status: "in_progress",
                        recentFeedback: []
                    };
                }

                const record = reportMap[subId];
                if (sub.status === "evaluated" && sub.marksObtained !== undefined && sub.marksObtained !== null) {
                    record.breakdown[type].obtained += sub.marksObtained;
                    record.totalObtained += sub.marksObtained;
                    
                    if (sub.feedback) {
                        record.recentFeedback.push({
                            task: sub.assignment.title,
                            comment: sub.feedback,
                            marks: sub.marksObtained,
                            max: sub.assignment.maxMarks
                        });
                    }
                } else if (sub.status === "submitted") {
                    record.breakdown[type].pending += 1;
                }
            });

            res.json({ 
                success: true, 
                data: Object.keys(report).map(title => ({
                    subject: title,
                    ...report[title]
                }))
            });
        } catch (error) {
            console.error("[Grades] fetch error:", error);
            next(error);
        }
    }
}
