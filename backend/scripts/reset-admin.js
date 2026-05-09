import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function resetAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        const email = "admin@smarttutoret.com";
        const newPassword = "Admin123!";
        
        console.log(`Searching for user: ${email}...`);
        const User = mongoose.model("User", new mongoose.Schema({
            email: String,
            password: String,
            role: String,
            isApproved: Boolean
        }));

        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ Admin user not found. Creating a new one...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            await User.create({
                name: "Super Admin",
                email: email,
                password: hashedPassword,
                role: "admin",
                isApproved: true
            });
            console.log(`✅ Admin created successfully!`);
        } else {
            console.log("✅ Admin user found. Updating password...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
            console.log(`✅ Password reset successfully!`);
        }

        console.log("\n-------------------------------------------");
        console.log("CREDENTIALS:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log("-------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

resetAdmin();
