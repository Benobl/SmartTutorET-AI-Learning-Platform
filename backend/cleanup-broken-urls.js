import mongoose from "mongoose";
import "dotenv/config";
import Subject from "./src/modules/courses/subject.model.js";
import LiveSession from "./src/modules/live/live.model.js";
import CourseContent from "./src/modules/courses/courseContent.model.js";
import Video from "./src/modules/courses/video.model.js";

const BROKEN_URL_DOMAIN = "storage.smarttutoret.com";

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for cleanup...");

        // 1. Cleanup Subject lessons
        const subjects = await Subject.find({ "lessons.videoUrl": { $regex: BROKEN_URL_DOMAIN } });
        console.log(`Found ${subjects.length} subjects with broken lesson URLs.`);
        for (const subject of subjects) {
            subject.lessons = subject.lessons.map(lesson => {
                if (lesson.videoUrl && lesson.videoUrl.includes(BROKEN_URL_DOMAIN)) {
                    console.log(`Cleaning up lesson: ${lesson.title}`);
                    lesson.videoUrl = null;
                }
                return lesson;
            });
            await subject.save();
        }

        // 2. Cleanup LiveSession recordings
        const liveSessions = await LiveSession.find({ recordingUrl: { $regex: BROKEN_URL_DOMAIN } });
        console.log(`Found ${liveSessions.length} live sessions with broken recording URLs.`);
        for (const session of liveSessions) {
            console.log(`Cleaning up session recording: ${session.title}`);
            session.recordingUrl = null;
            await session.save();
        }

        // 3. Cleanup Video documents
        const videos = await Video.find({ url: { $regex: BROKEN_URL_DOMAIN } });
        console.log(`Found ${videos.length} video documents with broken URLs.`);
        for (const video of videos) {
            console.log(`Removing broken video document: ${video._id}`);
            await Video.deleteOne({ _id: video._id });
            // Also remove corresponding CourseContent
            await CourseContent.deleteOne({ contentId: video._id });
        }

        console.log("Cleanup complete!");
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

cleanup();
