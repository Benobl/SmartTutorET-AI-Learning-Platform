import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/modules/users/user.model.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const adminEmail = "admin@smarttutoret.com";
        const adminPassword = "AdminPassword123!";

        // Overwrite if exists to fix double-hashing
        await User.deleteOne({ email: adminEmail });

        await User.create({
            name: "Super Admin",
            email: adminEmail,
            password: adminPassword, // Model's pre-save hook will hash this
            role: "admin",
            isApproved: true,
            isVerified: true,
            profile: {
                avatar: "https://avatar.iran.liara.run/public/1",
                bio: "Platform Administrator"
            },
            tutorStatus: "none"
        });

        console.log("✅ Admin user created successfully!");
        console.log("Email: admin@smarttutoret.com");
        console.log("Password: AdminPassword123!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedAdmin();
