import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function findTutors() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const tutors = await User.find({ role: 'tutor' }).select('name email _id');
        console.log('Tutors found:', JSON.stringify(tutors, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

findTutors();
