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
        console.log("🚀 Starting Data Consistency Fix...");

        // 1. Find submissions without assignments (orphaned)
        const allSubmissions = await AssignmentSubmission.find();
        let orphanedSubmissions = 0;
        for (const sub of allSubmissions) {
            const asm = await Assignment.findById(sub.assignment);
            if (!asm) {
                console.warn(`🗑️ Deleting orphaned submission: ${sub._id} (No assignment found)`);
                await AssignmentSubmission.findByIdAndDelete(sub._id);
                orphanedSubmissions++;
            }
        }
        console.log(`✅ Cleaned up ${orphanedSubmissions} orphaned submissions.`);

        // 2. Synchronize Enrollment and Subject.students
        const enrollments = await Enrollment.find();
        let syncedEnrollments = 0;
        for (const enr of enrollments) {
            const subject = await Subject.findById(enr.courseId);
            if (subject) {
                if (!subject.students.includes(enr.studentId)) {
                    console.log(`➕ Adding student ${enr.studentId} to subject ${subject.title} students array`);
                    subject.students.push(enr.studentId);
                    await subject.save();
                    syncedEnrollments++;
                }
            } else {
                console.warn(`❓ Enrollment found for non-existent subject: ${enr.courseId}`);
            }
        }
        console.log(`✅ Synchronized ${syncedEnrollments} enrollments to subjects.`);

        // 3. Fix assignment types (default to 'assignment')
        const assignments = await Assignment.find({ 
            type: { $nin: ["assignment", "quiz", "mid_exam", "final_exam"] } 
        });
        for (const asm of assignments) {
            console.log(`🔧 Fixing invalid type '${asm.type}' for assignment: ${asm.title}`);
            asm.type = "assignment";
            await asm.save();
        }
        console.log(`✅ Fixed types for ${assignments.length} assignments.`);

        console.log("🏁 Data Consistency Fix Complete!");
    } catch (error) {
        console.error("❌ Fix Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
