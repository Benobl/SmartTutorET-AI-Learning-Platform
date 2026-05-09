import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model("User", new mongoose.Schema({ email: String }));
        const tutor = await User.findOne({ email: "nobleek514@gmail.com" });
        
        if (!tutor) {
            console.log("❌ Tutor not found");
            process.exit(1);
        }

        const Subject = mongoose.model("Subject", new mongoose.Schema({ 
            title: String, 
            tutor: mongoose.Schema.Types.ObjectId,
            lessons: Array,
            status: String
        }, { collection: "subjects" }));

        const courses = await Subject.find({ tutor: tutor._id });
        console.log(`Found ${courses.length} courses for tutor:`);
        courses.forEach(c => {
            console.log(`- ${c.title} (Status: ${c.status}) | Lessons: ${c.lessons.length}`);
            c.lessons.forEach(l => console.log(`  * ${l.title} (${l.type})`));
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}
check();
