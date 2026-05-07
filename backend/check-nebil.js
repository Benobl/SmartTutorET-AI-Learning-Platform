import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/users/user.model.js';
import Assessment from './src/modules/assessments/assessment.model.js';

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'nebilbromance@gmail.com' });
    console.log("USER NEBIL:", {
        id: user?._id,
        role: user?.role,
        grade: user?.grade,
        stream: user?.stream
    });

    const quizzes = await Assessment.find({ grade: '9', isPublished: true });
    console.log("QUIZZES FOR GRADE 9:", quizzes.map(q => ({ title: q.title, grade: q.grade, published: q.isPublished })));
    
    await mongoose.disconnect();
}

check();
