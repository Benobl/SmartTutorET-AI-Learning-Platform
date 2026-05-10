import mongoose from "mongoose";
import "dotenv/config";
import LiveSession from "./src/modules/live/live.model.js";
import CourseContent from "./src/modules/courses/courseContent.model.js";
import Video from "./src/modules/courses/video.model.js";

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("\n=== DATABASE RECORDING CHECK ===\n");

        // 1. Check LiveSessions
        const sessions = await LiveSession.find({ recordingUrl: { $ne: null } });
        console.log(`Live Sessions with recordings: ${sessions.length}`);
        sessions.forEach(s => {
            console.log(`- Session: ${s.title} | URL: ${s.recordingUrl}`);
        });

        // 2. Check CourseContent (Videos from recordings)
        const content = await CourseContent.find({ category: "Video" }).populate("contentId");
        const recordings = content.filter(c => c.contentId && c.contentId.source === "recording");
        console.log(`\nCourse Content tagged as recordings: ${recordings.length}`);
        recordings.forEach(c => {
            console.log(`- Course: ${c.course} | Title: ${c.title} | URL: ${c.contentId.url}`);
        });

        // 3. Check all Videos
        const allVideos = await Video.find({ source: "recording" });
        console.log(`\nRaw Video documents (source=recording): ${allVideos.length}`);
        allVideos.forEach(v => {
            console.log(`- ID: ${v._id} | URL: ${v.url}`);
        });

        console.log("\n=== CHECK COMPLETE ===\n");
        process.exit(0);
    } catch (error) {
        console.error("Check failed:", error);
        process.exit(1);
    }
}

checkDatabase();
