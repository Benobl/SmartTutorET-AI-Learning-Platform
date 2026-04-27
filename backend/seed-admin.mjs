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

async function seedAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        const email = "admin@smarttutor.com";
        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`Admin account already exists with role: ${existing.role}`);
            if (existing.role !== "admin") {
                existing.role = "admin";
                await existing.save();
                console.log("Updated role to admin!");
            }
            await mongoose.disconnect();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("adminpassword", salt);

        const admin = await User.create({
            fullName: "System Admin",
            email,
            password: hashedPassword,
            role: "admin",
            tutorStatus: "none",
            isVerified: true,
            profilePic: "https://avatar.iran.liara.run/public/13.png",
            refreshTokens: [],
        });

        console.log("✅ Admin account created successfully!");
        console.log("  Email:", admin.email);
        console.log("  Role:", admin.role);
    } catch (err) {
        console.error("❌ Error seeding admin:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

seedAdmin();
