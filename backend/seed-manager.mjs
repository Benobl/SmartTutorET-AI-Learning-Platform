import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    tutorStatus: { type: String, default: "none" },
    isVerified: { type: Boolean, default: true },
    profilePic: { type: String, default: "" },
    refreshTokens: [String],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedManager() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        const email = "manager@smarttutor.com";
        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`Manager account already exists with role: ${existing.role}`);
            // Update role to manager if it's wrong
            if (existing.role !== "manager") {
                existing.role = "manager";
                await existing.save();
                console.log("Updated role to manager!");
            }
            await mongoose.disconnect();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("managerpassword", salt);

        const manager = await User.create({
            fullName: "School Manager",
            email,
            password: hashedPassword,
            role: "manager",
            tutorStatus: "none",
            isVerified: true,
            profilePic: "https://avatar.iran.liara.run/public/42.png",
            refreshTokens: [],
        });

        console.log("✅ Manager account created successfully!");
        console.log("  Email:", manager.email);
        console.log("  Role:", manager.role);
        console.log("  ID:", manager._id);
    } catch (err) {
        console.error("❌ Error seeding manager:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

seedManager();
