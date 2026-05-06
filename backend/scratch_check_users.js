import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const tutors = await User.find({ role: 'tutor' });
        tutors.forEach(t => {
            console.log(`Tutor: ${t.name}, Documents: `, JSON.stringify(t.documents, null, 2));
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
