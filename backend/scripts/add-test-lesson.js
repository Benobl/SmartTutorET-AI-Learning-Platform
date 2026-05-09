import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function addLesson() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Subject = mongoose.model("Subject", new mongoose.Schema({ 
            lessons: Array 
        }, { collection: "subjects" }));

        const courseId = "69fba4c430063fe0f33fa7ce"; // Biology
        const subject = await Subject.findById(courseId);
        
        if (!subject) {
            console.log("❌ Course not found");
            process.exit(1);
        }

        const newLesson = {
            title: "Cell Division Explained",
            videoUrl: "https://www.youtube.com/watch?v=f-ldPgEfAHI",
            duration: "12 min",
            type: "video"
        };

        subject.lessons.push(newLesson);
        await subject.save();
        console.log(`✅ Added lesson to ${courseId}. Total lessons: ${subject.lessons.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}
addLesson();
