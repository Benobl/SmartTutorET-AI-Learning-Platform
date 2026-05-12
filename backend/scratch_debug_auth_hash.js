import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/modules/users/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function testHash() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "test_reset_" + Date.now() + "@example.com";
    const password = "newPassword123";

    console.log(`Creating user with email: ${email} and password: ${password}`);
    
    const user = new User({
        name: "Test User",
        email: email,
        password: password,
        role: "student"
    });

    await user.save();
    console.log("User saved. Hashed password in DB:", user.password);

    const isMatch = await user.matchPassword(password);
    console.log("Initial match check:", isMatch);

    // Simulate reset
    console.log("\nSimulating reset...");
    const fetchedUser = await User.findOne({ email }).select("+password");
    fetchedUser.password = "anotherPassword456";
    await fetchedUser.save();
    console.log("User updated. New hashed password in DB:", fetchedUser.password);

    const isMatchAfterReset = await fetchedUser.matchPassword("anotherPassword456");
    console.log("Match check after reset:", isMatchAfterReset);

    // Cleanup
    await User.deleteOne({ email });
    await mongoose.disconnect();
}

testHash().catch(console.error);
