import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/modules/users/user.model.js";
import bcrypt from "bcryptjs";

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
await mongoose.connect(uri);

const hashedPassword = await bcrypt.hash("password123", 10);
await User.findOneAndUpdate(
    { email: "nebilbromance@gmail.com" },
    { password: hashedPassword }
);

console.log("✅ Student password reset to 'password123'");
process.exit(0);
