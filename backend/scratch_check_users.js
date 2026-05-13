import mongoose from "mongoose";
import User from "./src/modules/users/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const checkUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/smarttutor";
        await mongoose.connect(mongoUri);
        const count = await User.countDocuments();
        console.log(`Total users: ${count}`);
        const users = await User.find().limit(5).select("email role");
        console.log("Users:", JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
