import mongoose from "mongoose";
import User from "./src/modules/users/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function resetStaff() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Reset Admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
        admin.password = "admin123";
        admin.isApproved = true;
        admin.isVerified = true;
        await admin.save();
        console.log(`✅ Admin (${admin.email}) password reset to: admin123`);
    } else {
        console.log("❌ Admin not found");
    }

    // Reset Manager
    const manager = await User.findOne({ role: "manager" });
    if (manager) {
        manager.password = "manager123";
        manager.isApproved = true;
        manager.isVerified = true;
        await manager.save();
        console.log(`✅ Manager (${manager.email}) password reset to: manager123`);
    } else {
        console.log("❌ Manager not found");
    }

    await mongoose.disconnect();
}

resetStaff().catch(console.error);
