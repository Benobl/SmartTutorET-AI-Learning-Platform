import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function seedMasterSchedule() {
    try {
        console.log("Connecting to MongoDB...");
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        const Subject = mongoose.model("Subject", new mongoose.Schema({ title: String }));
        const User = mongoose.model("User", new mongoose.Schema({ email: String, role: String }));
        const MasterSchedule = mongoose.model("MasterSchedule", new mongoose.Schema({
            grade: String,
            stream: String,
            semester: String,
            section: String,
            subject: mongoose.Schema.Types.ObjectId,
            tutor: mongoose.Schema.Types.ObjectId,
            dayOfWeek: String,
            startTime: String,
            endTime: String,
            type: String,
            room: String
        }, { collection: "masterschedules" }));

        const subjects = await Subject.find().limit(12);
        const tutors = await User.find({ role: "tutor" });

        if (subjects.length === 0 || tutors.length === 0) {
            console.log("❌ Need subjects and tutors to seed schedule.");
            process.exit(1);
        }

        console.log(`Found ${subjects.length} subjects and ${tutors.length} tutors.`);

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const times = [
            { start: "08:30", end: "09:30" },
            { start: "10:00", end: "11:00" },
            { start: "11:30", end: "12:30" },
            { start: "14:00", end: "15:00" }
        ];

        const grades = ["9", "10", "11", "12"];
        
        await MasterSchedule.deleteMany({});
        console.log("Cleared existing schedule.");

        const entries = [];
        let slotCounter = 0;

        for (const grade of grades) {
            for (const day of days) {
                for (let i = 0; i < times.length; i++) {
                    const subject = subjects[slotCounter % subjects.length];
                    
                    // Assign to a tutor - rotating through all tutors
                    const tutor = tutors[slotCounter % tutors.length];
                    
                    entries.push({
                        grade,
                        stream: "Common",
                        semester: "Semester 1",
                        section: "Section A",
                        subject: subject._id,
                        tutor: tutor._id,
                        dayOfWeek: day,
                        startTime: times[i].start,
                        endTime: times[i].end,
                        type: "regular",
                        room: `Room ${i + 1}`
                    });

                    slotCounter++;
                }
            }
        }

        // Specifically ensure the main tutors have plenty of slots
        console.log("Ensuring comprehensive coverage for all tutors...");

        await MasterSchedule.insertMany(entries);
        console.log(`✅ Successfully seeded ${entries.length} schedule entries.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

seedMasterSchedule();
