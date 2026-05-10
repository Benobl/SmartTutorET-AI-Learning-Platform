import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/modules/users/user.model.js';
import Subject from './src/modules/courses/subject.model.js';

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'nebilbromance@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
        console.log("User not found");
        process.exit(1);
    }
    
    console.log("User Details:", {
        _id: user._id,
        name: user.name,
        email: user.email,
        grade: user.grade,
        role: user.role
    });
    
    const enrolled = await Subject.find({ students: user._id });
    console.log("\nExplicitly Enrolled Subjects:", enrolled.length);
    enrolled.forEach(s => console.log(` - ${s.title} (Premium: ${s.isPremium}, Status: ${s.status}, Grade: ${s.grade})`));
    
    if (user.grade) {
        const freeGrade = await Subject.find({
            isPremium: false,
            grade: parseInt(user.grade),
            status: "approved",
            students: { $ne: user._id }
        });
        console.log("\nFree Grade Subjects (not explicitly enrolled):", freeGrade.length);
        freeGrade.forEach(s => console.log(` - ${s.title} (Grade: ${s.grade})`));
    }
    
    const allApproved = await Subject.find({ status: "approved" });
    console.log("\nTotal Approved Subjects in DB:", allApproved.length);
    
    const allSubjects = await Subject.find({});
    console.log("Total Subjects in DB:", allSubjects.length);

    process.exit(0);
}

check();
