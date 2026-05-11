import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const announcementSchema = new mongoose.Schema({
    title: String,
    body: String,
    category: String,
    targetGrade: String,
    role: String,
}, { timestamps: true });

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);

async function listAnnouncements() {
    try {
        await mongoose.connect(MONGO_URI);
        const all = await Announcement.find({}).sort({ createdAt: -1 });
        console.log("Total announcements:", all.length);
        console.log("Details:", JSON.stringify(all, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

listAnnouncements();
