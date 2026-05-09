import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model("User", new mongoose.Schema({ email: String, grade: String }));
        const student = await User.findOne({ email: "nebilbromance@gmail.com" });
        console.log(`Student: ${student.email} | Grade: ${student.grade}`);

        const Subject = mongoose.model("Subject", new mongoose.Schema({ 
            title: String, 
            grade: Number,
            status: String
        }, { collection: "subjects" }));

        const subjects = await Subject.find({ grade: student.grade, status: "approved" });
        console.log(`Approved subjects for Grade ${student.grade}: ${subjects.length}`);
        subjects.forEach(s => console.log(`- ${s.title} (${s._id})`));

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}
check();
