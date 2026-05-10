import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';
import MasterSchedule from './src/modules/scheduling/master-schedule.model.js';
import Subject from './src/modules/courses/subject.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'nobleek514@gmail.com' });
        if (!user) {
            console.log("User not found");
            process.exit(1);
        }
        console.log(`User found: ${user.name} (${user._id})`);

        const schedules = await MasterSchedule.find({ tutor: user._id }).populate('subject');
        console.log(`Found ${schedules.length} schedules for this tutor`);
        schedules.forEach(s => {
            console.log(`- ${s.dayOfWeek} at ${s.startTime}: ${s.subject?.title} (Grade ${s.grade})`);
        });

        const allSchedules = await MasterSchedule.find({}).limit(5);
        console.log(`Total schedules in DB: ${await MasterSchedule.countDocuments()}`);
        console.log("Sample schedules:");
        allSchedules.forEach(s => {
            console.log(`- Tutor ID: ${s.tutor}, Day: ${s.dayOfWeek}, Time: ${s.startTime}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
