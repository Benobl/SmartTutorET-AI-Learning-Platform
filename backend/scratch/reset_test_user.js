import mongoose from "mongoose";
import "dotenv/config";
import User from "../src/modules/users/user.model.js";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: "nebilbromance@gmail.com" });
        if (user) {
            console.log("User found:", user.email);
            // Force reset password for testing if needed
            user.password = "password123";
            await user.save();
            console.log("Password reset to password123 for testing.");
        } else {
            console.log("User not found.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}
run();
