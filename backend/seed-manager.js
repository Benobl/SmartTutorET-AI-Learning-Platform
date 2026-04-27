import mongoose from "mongoose";
import "dotenv/config";
import User from "./src/modules/users/user.model.js";

const seedManager = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        const managerEmail = "manager@smarttutor.com";
        const existing = await User.findOne({ email: managerEmail });

        if (existing) {
            console.log("Manager already exists. Updating password/role...");
            existing.password = "managerpassword";
            existing.role = "manager";
            existing.isVerified = true;
            await existing.save();
        } else {
            console.log("Creating new manager account...");
            await User.create({
                fullName: "Main School Manager",
                email: managerEmail,
                password: "managerpassword",
                role: "manager",
                isVerified: true
            });
        }

        console.log("Manager account synchronization complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedManager();
