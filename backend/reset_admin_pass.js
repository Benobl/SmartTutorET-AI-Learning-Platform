import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String },
    role: String,
    isApproved: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function resetAuth() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const targetPassword = "admin123";
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(targetPassword, salt);

        const accounts = [
            { email: "admin@smarttutor.com", name: "System Admin", role: "admin" },
            { email: "manager@smarttutor.com", name: "Main School Manager", role: "manager" }
        ];

        for (const acc of accounts) {
            let user = await User.findOne({ email: acc.email });
            if (user) {
                user.password = hashed;
                user.role = acc.role; // Ensure role is correct
                user.isApproved = true;
                user.isVerified = true;
                await user.save();
                console.log(`Updated existing user: ${acc.email}`);
            } else {
                await User.create({
                    ...acc,
                    password: hashed,
                    isApproved: true,
                    isVerified: true
                });
                console.log(`Created new user: ${acc.email}`);
            }
        }

        console.log("\n✅ Auth Reset Complete!");
        console.log(`Target Password for all: ${targetPassword}`);

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

resetAuth();
