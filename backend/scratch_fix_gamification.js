import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smarttutor";

async function cleanup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const collection = mongoose.connection.db.collection('gamifications');
        const profiles = await collection.find({}).toArray();
        
        console.log(`Found ${profiles.length} profiles`);

        for (const profile of profiles) {
            let corrupted = false;
            if (typeof profile.dailyMissions === 'string') {
                console.log(`User ${profile.user}: dailyMissions is a string. Repairing...`);
                corrupted = true;
            } else if (Array.isArray(profile.dailyMissions)) {
                if (profile.dailyMissions.some(m => typeof m === 'string' || m === null)) {
                    console.log(`User ${profile.user}: dailyMissions contains strings or nulls. Repairing...`);
                    corrupted = true;
                }
            } else {
                console.log(`User ${profile.user}: dailyMissions is neither string nor array. Repairing...`);
                corrupted = true;
            }

            if (corrupted) {
                const DEFAULT_MISSIONS = [
                    { id: "daily_login", title: "Show Up", type: "login", target: 1, xpReward: 10, progress: 0, isCompleted: false },
                    { id: "daily_quiz", title: "Brain Teaser", type: "quiz", target: 1, xpReward: 50, progress: 0, isCompleted: false },
                    { id: "daily_assignment", title: "Homework Hero", type: "assignment", target: 1, xpReward: 100, progress: 0, isCompleted: false }
                ];
                await collection.updateOne(
                    { _id: profile._id },
                    { $set: { dailyMissions: DEFAULT_MISSIONS } }
                );
                console.log(`User ${profile.user}: Repaired.`);
            }
        }

        console.log("Cleanup complete.");
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

cleanup();
