import mongoose from 'mongoose';
import '../src/modules/courses/subject.model.js';
import User from '../src/modules/users/user.model.js';
import Subject from '../src/modules/courses/subject.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        console.log('URI:', uri ? 'FOUND' : 'MISSING');
        await mongoose.connect(uri);
        const user = await User.findOne({ email: 'nobleek514@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        console.log('User ID:', user._id, 'Role:', user.role, 'TutorStatus:', user.tutorStatus);
        
        const subjects = await Subject.find({ tutor: user._id });
        console.log('Subjects found:', subjects.length);
        subjects.forEach(s => {
            console.log(`- Title: ${s.title}, Status: ${s.status}, IsPremium: ${s.isPremium}, Price: ${s.price}`);
        });
        
        const pending = await Subject.find({ status: 'pending' });
        console.log('Total pending subjects in DB:', pending.length);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
