import mongoose from "mongoose";
import "dotenv/config";
import User from "../src/modules/users/user.model.js";
import Assignment from "../src/modules/assessments/assignment.model.js";
import AssignmentSubmission from "../src/modules/assessments/assignmentSubmission.model.js";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const student = await User.findOne({ email: "nebilbromance@gmail.com" });
        if (!student) {
            console.log("Student not found");
            return;
        }
        console.log("Student ID:", student._id);
        
        const submissions = await AssignmentSubmission.find({ student: student._id }).populate("assignment");
        console.log("Submissions found:", submissions.length);
        console.log(JSON.stringify(submissions, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
