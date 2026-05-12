import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/modules/users/user.model.js";
import { connectDB } from "../src/lib/db.js";

async function testAuth() {
    await connectDB();
    console.log("Connected to DB");

    const email = "test_auth_debug@example.com";
    const password = "Password123!";

    // Cleanup
    await User.deleteOne({ email });

    // 1. Create User
    console.log("\n--- Testing Signup ---");
    const user = new User({
        email,
        name: "Test User",
        role: "student",
        password: password
    });
    
    console.log("Password before save:", user.password);
    await user.save();
    
    const savedUser = await User.findOne({ email }).select("+password");
    console.log("Password after save (DB):", savedUser.password);
    console.log("Is hashed?", savedUser.password.startsWith("$2a$"));

    const isMatch = await savedUser.matchPassword(password);
    console.log("Match check 1 (original):", isMatch);

    // 2. Testing Reset
    console.log("\n--- Testing Reset ---");
    const newPassword = "NewPassword456!";
    savedUser.password = newPassword;
    await savedUser.save();

    const resetUser = await User.findOne({ email }).select("+password");
    console.log("Password after reset (DB):", resetUser.password);
    
    const isMatchNew = await resetUser.matchPassword(newPassword);
    console.log("Match check 2 (new):", isMatchNew);

    const isMatchOld = await resetUser.matchPassword(password);
    console.log("Match check 3 (old - should be false):", isMatchOld);

    await User.deleteOne({ email });
    console.log("\nDebug complete.");
    process.exit(0);
}

testAuth().catch(err => {
    console.error(err);
    process.exit(1);
});
