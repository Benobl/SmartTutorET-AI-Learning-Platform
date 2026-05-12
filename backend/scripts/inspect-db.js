import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db.js";

async function check() {
    try {
        await connectDB();
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        const gamifications = await mongoose.connection.db.collection('gamifications').find({}).toArray();
        console.log("Gamifications count:", gamifications.length);
        if (gamifications.length > 0) {
            console.log("First record dailyMissions:", JSON.stringify(gamifications[0].dailyMissions, null, 2));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
