import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/modules/users/user.model.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

async function verifyFix() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "verify_fix_" + Date.now() + "@example.com";
    const password = "newPassword123";

    console.log(`\n1. Creating user: ${email}`);
    const user = new User({
        name: "Verify User",
        email: email,
        password: password,
        role: "student",
        isVerified: true
    });
    await user.save();
    console.log("✅ User created and hashed.");

    console.log("\n2. Simulating Forgot Password...");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    
    const fetchedForReset = await User.findOne({ email });
    fetchedForReset.resetPasswordToken = hashedToken;
    fetchedForReset.resetPasswordExpire = Date.now() + 3600000;
    await fetchedForReset.save();
    console.log("✅ Reset token saved.");

    console.log("\n3. Simulating Reset Password...");
    const userToReset = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!userToReset) throw new Error("User not found by token!");
    
    userToReset.password = "updatedPassword456";
    userToReset.resetPasswordToken = undefined;
    userToReset.resetPasswordExpire = undefined;
    userToReset.refreshTokens = [];
    await userToReset.save();
    console.log("✅ Password updated and tokens cleared.");

    console.log("\n4. Verifying Login Selection...");
    // This query simulates the exact one in AuthService.login
    const loggedInUser = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");
    
    console.log("Fields returned:", Object.keys(loggedInUser.toObject()));
    
    if (!loggedInUser.refreshTokens) {
        console.error("❌ ERROR: refreshTokens is MISSING from selection!");
    } else {
        console.log("✅ SUCCESS: refreshTokens is present.");
    }

    const isMatch = await loggedInUser.matchPassword("updatedPassword456");
    console.log("Password match result:", isMatch);
    
    if (isMatch) {
        console.log("✅ SUCCESS: Login works with new password.");
    } else {
        console.error("❌ ERROR: Password match failed!");
    }

    // Cleanup
    await User.deleteOne({ email });
    console.log("\n✅ Cleanup done.");
    await mongoose.disconnect();
}

verifyFix().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
