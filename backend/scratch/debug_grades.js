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

        console.log(`[Debug] Student: ${student.email}, ID: ${studentId}, Grade: ${studentGrade}`);

        // 1. Enrollments
        const enrollments = await Enrollment.find({ studentId }).select("courseId");
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        console.log("Enrollment courseIds:", enrolledCourseIds);

        // 2. Subject students array
        const subjectsByArray = await Subject.find({ students: studentId }).select("_id title");
        console.log("Subjects by array:", subjectsByArray.map(s => ({ id: s._id, title: s.title })));

        // 3. Free subjects
        const freeSubjectQuery = {
            isPremium: false,
            $or: [{ status: "approved" }, { status: { $exists: false } }]
        };
        if (studentGrade) freeSubjectQuery.grade = studentGrade;
        const freeSubjects = await Subject.find(freeSubjectQuery).select("_id title");
        console.log("Free subjects:", freeSubjects.map(s => ({ id: s._id, title: s.title })));

        const allTargetSubjectIds = [...new Set([
            ...enrolledCourseIds.map(id => id.toString()),
            ...subjectsByArray.map(s => s._id.toString()),
            ...freeSubjectIds_dummy_fix(freeSubjects)
        ])];

        function freeSubjectIds_dummy_fix(fs) { return fs.map(s => s._id.toString()); }

        console.log("All Target Subject IDs:", allTargetSubjectIds);

        const enrolledSubjects = await Subject.find({ _id: { $in: allTargetSubjectIds } });
        console.log("Enrolled Subjects Found:", enrolledSubjects.length);

        const submissions = await AssignmentSubmission.find({ student: studentId }).populate("assignment");
        console.log("Submissions count:", submissions.length);
        
        submissions.forEach(sub => {
            if (sub.assignment) {
                console.log(`Submission for Assignment: ${sub.assignment.title}, Status: ${sub.status}, Marks: ${sub.marksObtained}, Subject ID in assignment: ${sub.assignment.subject}`);
                const isSubjectInTargets = allTargetSubjectIds.includes(sub.assignment.subject.toString());
                console.log(`Is assignment subject (${sub.assignment.subject}) in target list? ${isSubjectInTargets}`);
            } else {
                console.log(`Submission ${sub._id} has NO assignment reference!`);
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
