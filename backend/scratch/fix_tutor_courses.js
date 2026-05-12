import mongoose from 'mongoose';
import '../src/modules/courses/subject.model.js';
import User from '../src/modules/users/user.model.js';
import Subject from '../src/modules/courses/subject.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fix() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        const user = await User.findOne({ email: 'nobleek514@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        
        // Find all subjects by this tutor that are approved and set them to pending
        const result = await Subject.updateMany(
            { tutor: user._id, status: 'approved' },
            { $set: { status: 'pending' } }
        );
        
        console.log(`Updated ${result.modifiedCount} subjects to pending status.`);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fix();
