import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function listUsers() {
    try {
        console.log("Connecting to MongoDB...");
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGO_URI not found in .env");
        
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        const users = await mongoose.connection.db.collection("users").find({}).toArray();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Approved: ${u.isApproved}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

listUsers();
