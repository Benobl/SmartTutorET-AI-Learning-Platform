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
        const student = await User.findOne({ email: "nebilbromance@gmail.com" });
        const studentId = student._id;
        const studentGrade = student.grade;

        // Simulate getStudentGrades logic
        const enrollments = await Enrollment.find({ studentId }).select("courseId");
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        
        const subjectsByArray = await Subject.find({ students: studentId }).select("_id");
        const arraySubjectIds = subjectsByArray.map(s => s._id);

        const freeSubjectQuery = {
            isPremium: false,
            $or: [{ status: "approved" }, { status: { $exists: false } }]
        };
        if (studentGrade) freeSubjectQuery.grade = studentGrade;
        const freeSubjects = await Subject.find(freeSubjectQuery).select("_id");
        const freeSubjectIds = freeSubjects.map(s => s._id);

        const allTargetSubjectIds = [...new Set([
            ...enrolledCourseIds.map(id => id.toString()),
            ...arraySubjectIds.map(id => id.toString()),
            ...freeSubjectIds.map(id => id.toString())
        ])];

        const enrolledSubjects = await Subject.find({ _id: { $in: allTargetSubjectIds } });
        const allAssignments = await Assignment.find({ subject: { $in: allTargetSubjectIds } }).populate("subject", "title");
        const submissions = await AssignmentSubmission.find({ student: studentId }).populate("assignment");

        const report = {};
        enrolledSubjects.forEach(sub => {
            report[sub.title] = {
                subjectId: sub._id,
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
            const subjectTitle = asm.subject.title;
            if (!report[subjectTitle]) report[subjectTitle] = { /* ... */ };
            const type = asm.type || "assignment";
            if (report[subjectTitle].breakdown[type]) {
                report[subjectTitle].breakdown[type].max += asm.maxMarks;
                report[subjectTitle].breakdown[type].count += 1;
                report[subjectTitle].totalPossible += asm.maxMarks;
            }
        });

        submissions.forEach(sub => {
            if (!sub.assignment) return;
            // The bug I suspected: sub.assignment.subject is an ID, not populated.
            // But we find it in allAssignments.
            const asm = allAssignments.find(a => a._id.toString() === sub.assignment._id.toString());
            if (!asm || !asm.subject) return;
            
            const subjectTitle = asm.subject.title;
            const type = asm.type || "assignment";

            if (sub.status === "evaluated" && sub.marksObtained !== undefined && sub.marksObtained !== null) {
                report[subjectTitle].breakdown[type].obtained += sub.marksObtained;
                report[subjectTitle].totalObtained += sub.marksObtained;
            }
        });

        console.log("FINAL REPORT FOR NEBIL:");
        console.log(JSON.stringify(report, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
