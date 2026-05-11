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

async function seedAnnouncements() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const manager = await User.findOne({ role: "manager" });
        if (!manager) {
            console.error("No manager found to attribute announcements to.");
            return;
        }

        const samples = [
            {
                title: "Semester Final Examination Schedule",
                body: "The final exams for all grades will commence on June 15th. Please check your subject-specific portals for the detailed timetable.",
                category: "exam",
                targetGrade: "", // Global
                createdBy: manager._id,
                role: "manager"
            },
            {
                title: "Official National Holiday Notice",
                body: "The school will remain closed this coming Friday in observance of the National Holiday. All live sessions are suspended.",
                category: "holiday",
                targetGrade: "", // Global
                createdBy: manager._id,
                role: "manager"
            },
            {
                title: "Mid-Term Academic Progress Audit",
                body: "Students are advised to review their mid-term assessment scores. The Registrar office will be conducting audits starting next week.",
                category: "administrative",
                targetGrade: "", // Global
                createdBy: manager._id,
                role: "manager"
            }
        ];

        // Clear old ones to avoid clutter
        await Announcement.deleteMany({ role: "manager" });
        console.log("Cleaned up old manager announcements.");

        await Announcement.create(samples);
        console.log("✅ Seeded 3 professional registrar announcements successfully!");

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedAnnouncements();
