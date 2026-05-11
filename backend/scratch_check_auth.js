import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: true },
    role: String,
    isApproved: Boolean,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({ email: /admin|manager/i });
        console.log("Users found:", JSON.stringify(users, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
