import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function initAcademicSquads() {
    try {
        console.log("Connecting to MongoDB...");
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        // Define Group Schema locally to avoid import issues
        const Group = mongoose.model("Group", new mongoose.Schema({
            name: String,
            grade: Number,
            topic: String,
            avatar: String,
            type: String,
            isGlobal: Boolean,
            createdBy: mongoose.Schema.Types.ObjectId,
            members: [mongoose.Schema.Types.ObjectId]
        }, { collection: "studygroups" }));

        const User = mongoose.model("User", new mongoose.Schema({
            name: String,
            role: String,
            grade: Number,
            email: String
        }));

        const admin = await User.findOne({ role: "admin" });
        if (!admin) throw new Error("No admin user found to create squads.");

        const grades = [9, 10, 11, 12];
        const avatars = { 9: "🎒", 10: "📚", 11: "🔬", 12: "🎓" };

        for (const grade of grades) {
            console.log(`Processing Grade ${grade}...`);
            
            let squad = await Group.findOne({ grade, name: `Grade ${grade} Academic Squad` });
            
            const students = await User.find({ grade, role: "student" });
            const studentIds = students.map(s => s._id);

            if (!squad) {
                console.log(`Creating Grade ${grade} Squad...`);
                squad = await Group.create({
                    name: `Grade ${grade} Academic Squad`,
                    grade,
                    topic: `Official Academic Hub for Grade ${grade}`,
                    avatar: avatars[grade],
                    type: "academic",
                    isGlobal: true,
                    createdBy: admin._id,
                    members: studentIds
                });
                console.log(`✅ Created Grade ${grade} Squad.`);
            } else {
                console.log(`Squad already exists. Syncing members...`);
                squad.members = Array.from(new Set([...squad.members.map(m => m.toString()), ...studentIds.map(s => s.toString())]));
                await squad.save();
                console.log(`✅ Synced ${squad.members.length} members for Grade ${grade}.`);
            }
        }

        console.log("🚀 All academic squads initialized successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

initAcademicSquads();
