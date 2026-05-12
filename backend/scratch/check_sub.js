import mongoose from "mongoose";
import "dotenv/config";
import AssignmentSubmission from "../src/modules/assessments/assignmentSubmission.model.js";
import Assignment from "../src/modules/assessments/assignment.model.js";
import Subject from "../src/modules/courses/subject.model.js";
import Enrollment from "../src/modules/learning/enrollment.model.js";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const sub = await AssignmentSubmission.findOne({ student: "6a0306cefd743283549c15d1" }).populate("assignment");
        console.log("Submission for nebilbromance:", JSON.stringify(sub, null, 2));

        if (sub && sub.assignment) {
            const subjectId = sub.assignment.subject;
            const subject = await Subject.findById(subjectId);
            const enrollment = await Enrollment.findOne({ 
                studentId: "6a0306cefd743283549c15d1", 
                courseId: subjectId 
            });
            console.log("Subject:", subject ? subject.title : "Not found");
            const isEnrolled = subject?.students.some(s => s.toString() === "6a0306cefd743283549c15d1");
            console.log("Is student in subject.students array?", isEnrolled);
            console.log("Enrollment record exists?", !!enrollment);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
