import mongoose from "mongoose";
import "dotenv/config";
import User from "../src/modules/users/user.model.js";
import Subject from "../src/modules/courses/subject.model.js";
import Assignment from "../src/modules/assessments/assignment.model.js";
import AssignmentSubmission from "../src/modules/assessments/assignmentSubmission.model.js";
import Enrollment from "../src/modules/learning/enrollment.model.js";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const studentId = "6a0306cefd743283549c15d1";
        const student = await User.findById(studentId);
        const studentGrade = student.grade;

        console.log(`[Test] Fetching report for Student: ${studentId}, Grade: ${studentGrade}`);

        // REPLICATING CONTROLLER LOGIC
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

        const enrolledSubjects = await Subject.find({ _id: { $in: allTargetSubjectIds } });
        const allAssignments = await Assignment.find({ 
            subject: { $in: allTargetSubjectIds } 
        }).populate("subject", "title");

        const submissions = await AssignmentSubmission.find({ 
            student: studentId 
        }).populate({
            path: "assignment",
            populate: { path: "subject", select: "title" }
        });

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

        allAssignments.forEach(asm => {
            if (!asm.subject) return;
            const subId = asm.subject._id.toString();
            let type = asm.type || "assignment";
            if (!["assignment", "quiz", "mid_exam", "final_exam"].includes(type)) type = "assignment";

            if (reportMap[subId]) {
                reportMap[subId].breakdown[type].max += asm.maxMarks;
                reportMap[subId].breakdown[type].count += 1;
                reportMap[subId].totalPossible += asm.maxMarks;
            }
        });

        submissions.forEach(sub => {
            if (!sub.assignment || !sub.assignment.subject) return;

            const subId = sub.assignment.subject._id.toString();
            let type = sub.assignment.type || "assignment";
            if (!["assignment", "quiz", "mid_exam", "final_exam"].includes(type)) type = "assignment";

            if (!reportMap[subId]) {
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

        const finalReport = Object.values(reportMap);
        const biologyReport = finalReport.find(r => r.subject === "Biology");
        console.log("Biology Report:", JSON.stringify(biologyReport, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
