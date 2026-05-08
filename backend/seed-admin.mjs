import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

// Fix DNS for local connection issues
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// User Schema (Must match the main model for pre-save hooks to work)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["student", "tutor", "manager", "admin"] },
    isApproved: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    profile: { avatar: String, bio: String },
    tutorStatus: { type: String, default: "none" },
}, { timestamps: true });

// Password hashing hook (matching user.model.js)
import bcrypt from "bcryptjs";
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected Successfully!");

        const email = "admin@smarttutor.com";
        
        // Delete existing admin to ensure a fresh, correct password hash
        await User.deleteOne({ email });
        console.log("Cleaned up existing admin account.");

        await User.create({
            name: "System Admin",
            email,
            password: "adminpassword", // The pre-save hook will hash this once
            role: "admin",
            isApproved: true,
            isVerified: true,
            tutorStatus: "none",
            profile: { 
                avatar: "https://avatar.iran.liara.run/public/13.png", 
                bio: "Platform Administrator" 
            }
        });

        console.log("✅ Admin account RE-CREATED successfully!");
        console.log("  Email: admin@smarttutor.com");
        console.log("  Password: adminpassword");
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

seedAdmin();
