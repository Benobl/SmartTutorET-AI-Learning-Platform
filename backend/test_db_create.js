import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, required: true },
    targetGrade: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({ email: String, role: String }));
const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);

async function testCreate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const manager = await User.findOne({ role: "manager" });
        if (!manager) {
            console.error("No manager found.");
            return;
        }

        const a = await Announcement.create({
            title: "Real Database Test",
            body: "This is a real announcement from the backend script.",
            category: "general",
            targetGrade: "",
            createdBy: manager._id,
            role: "manager"
        });
        console.log("✅ Created announcement:", a._id);

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

testCreate();
