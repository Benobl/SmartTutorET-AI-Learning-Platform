import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/users/user.model.js";

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "test@gmail.com";
        const newPass = "password123";

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            console.error("User not found");
            process.exit(1);
        }

        console.log("Current Hash:", user.password);
        user.password = newPass;
        await user.save();
        
        const updatedUser = await User.findOne({ email }).select("+password");
        console.log("New Hash:", updatedUser.password);

        const isMatch = await updatedUser.matchPassword(newPass);
        console.log(`Match Result: ${isMatch}`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

resetPassword();
