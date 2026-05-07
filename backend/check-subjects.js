import mongoose from "mongoose";
import dotenv from "dotenv";
import Subject from "./src/modules/courses/subject.model.js";
import User from "./src/modules/users/user.model.js";

dotenv.config();

async function checkSubjects() {
    await mongoose.connect(process.env.MONGO_URI);
    const tutor = await User.findOne({ email: "nobleek514@gmail.com" });
    if (!tutor) {
        console.log("Tutor not found.");
        await mongoose.disconnect();
        return;
    }

    const subjects = await Subject.find({ grade: 9 });
    console.log(`Found ${subjects.length} subjects for Grade 9.`);
    
    for (const sub of subjects) {
        console.log(`- ${sub.title} (Assigned to: ${sub.tutor})`);
        if (sub.tutor.toString() !== tutor._id.toString()) {
            sub.tutor = tutor._id;
            await sub.save();
            console.log(`  Updated assignment to ${tutor.email}`);
        }
    }
    await mongoose.disconnect();
}

checkSubjects();
