import mongoose from 'mongoose';
import MasterSchedule from './src/modules/scheduling/master-schedule.model.js';
import User from './src/modules/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function reassign() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const fromTutorId = '69f1bbdf724cc355beedd4e1';
        const toTutorEmail = 'nobleek514@gmail.com';
        
        const toUser = await User.findOne({ email: toTutorEmail });
        if (!toUser) {
            console.log("Target user not found");
            process.exit(1);
        }
        
        const result = await MasterSchedule.updateMany(
            { tutor: fromTutorId },
            { $set: { tutor: toUser._id } }
        );
        
        console.log(`Successfully reassigned ${result.modifiedCount} schedule entries from Nebil Abdo to Noble Abdo.`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reassign();
