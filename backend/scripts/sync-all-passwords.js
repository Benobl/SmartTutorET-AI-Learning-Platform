import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function syncAllPasswords() {
    try {
        console.log("Connecting to MongoDB...");
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        const standardPassword = "SmartTutor123!";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(standardPassword, salt);

        const User = mongoose.model("User", new mongoose.Schema({
            email: String,
            password: String,
            name: String,
            role: String
        }));

        console.log("Fetching all users...");
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        console.log(`Updating all passwords to: ${standardPassword}`);
        
        const result = await User.updateMany({}, { $set: { password: hashedPassword } });
        
        console.log(`✅ Successfully updated ${result.modifiedCount} users.`);

        console.log("\n--- UPDATED USER LIST ---");
        users.forEach(user => {
            console.log(`- ${user.role.toUpperCase().padEnd(8)} | ${user.name.padEnd(20)} | ${user.email}`);
        });
        console.log("-------------------------\n");

        console.log("ALL USERS CAN NOW LOGIN WITH:");
        console.log(`Password: ${standardPassword}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

syncAllPasswords();
