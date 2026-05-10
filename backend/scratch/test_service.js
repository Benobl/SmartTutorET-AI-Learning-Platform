
import mongoose from "mongoose";
import { SubjectService } from "../src/modules/courses/subject.service.js";
import User from "../src/modules/users/user.model.js";

async function testService() {
    await mongoose.connect("mongodb+srv://nebilbromance_db_user:a9icx9Qh1v00qran@cluster0.d38tvxt.mongodb.net/streamify_db?appName=Cluster0");
    
    const tutorEmail = "nobleek514@gmail.com";
    const tutor = await User.findOne({ email: tutorEmail });
    
    if (!tutor) {
        console.log("Tutor not found");
        process.exit(1);
    }
    
    console.log("Calling getTutorStudents for:", tutor._id);
    const students = await SubjectService.getTutorStudents(tutor._id.toString());
    
    console.log("Students returned by service:", students.length);
    students.forEach(s => {
        console.log(` - ${s.name} (${s.email}, Courses: ${s.courses.length})`);
    });
    
    process.exit(0);
}

testService();
