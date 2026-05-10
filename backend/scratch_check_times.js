import mongoose from 'mongoose';
import MasterSchedule from './src/modules/scheduling/master-schedule.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const slots = await MasterSchedule.distinct('startTime');
        console.log("Unique start times in DB:", slots.sort());
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
