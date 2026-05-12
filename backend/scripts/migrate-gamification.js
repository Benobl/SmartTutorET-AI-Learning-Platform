import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db.js";
import { Gamification } from "../src/modules/gamification/gamification.model.js";

const DEFAULT_MISSIONS = [
    { id: "daily_login", title: "Show Up", type: "login", target: 1, xpReward: 10 },
    { id: "daily_quiz", title: "Brain Teaser", type: "quiz", target: 1, xpReward: 50 },
    { id: "daily_assignment", title: "Homework Hero", type: "assignment", target: 1, xpReward: 100 }
];

async function migrate() {
    try {
        await connectDB();
        console.log("Connected to MongoDB for migration...");

        // Use native driver to find all documents with malformed dailyMissions
        const collection = mongoose.connection.db.collection('gamifications');
        const profiles = await collection.find({}).toArray();

        console.log(`Found ${profiles.length} profiles to check.`);

        let repairCount = 0;
        for (const profile of profiles) {
            let needsRepair = false;
            
            if (!Array.isArray(profile.dailyMissions)) {
                needsRepair = true;
            } else if (profile.dailyMissions.some(m => typeof m === 'string' || !m.id)) {
                needsRepair = true;
            }

            if (needsRepair) {
                console.log(`Repairing profile for user ${profile.user}...`);
                await collection.updateOne(
                    { _id: profile._id },
                    { $set: { dailyMissions: DEFAULT_MISSIONS } }
                );
                repairCount++;
            }
        }

        console.log(`Migration complete. Repaired ${repairCount} profiles.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
