
import mongoose from "mongoose";
import User from "../backend/src/modules/users/user.model.js";
import Subject from "../backend/src/modules/courses/subject.model.js";

async function debug() {
    await mongoose.connect("mongodb+srv://nebilbromance_db_user:a9icx9Qh1v00qran@cluster0.d38tvxt.mongodb.net/streamify_db?appName=Cluster0");
    
    const tutorEmail = "nobleek514@gmail.com";
    const tutor = await User.findOne({ email: tutorEmail });
    
    if (!tutor) {
        console.log("Tutor not found:", tutorEmail);
        process.exit(1);
    }
    
    console.log("Tutor ID:", tutor._id);
    
    const subjects = await Subject.find({ tutor: tutor._id });
    console.log("Subjects found for tutor:", subjects.length);
    subjects.forEach(s => console.log(` - ${s.title} (Grade: ${s.grade})`));
    
    const students = await User.find({ role: "student" });
    console.log("Total students in DB:", students.length);
    students.forEach(s => console.log(` - ${s.name} (${s.email}, Grade: ${s.grade})`));
    
    process.exit(0);
}

debug();
