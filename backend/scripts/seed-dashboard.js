import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smarttutor";

// Import Models
import User from "../src/modules/users/user.model.js";
import Subject from "../src/modules/courses/subject.model.js";
import Announcement from "../src/modules/announcements/announcement.model.js";
import Assessment from "../src/modules/assessments/assessment.model.js";
import Attempt from "../src/modules/assessments/attempt.model.js";
import Assignment from "../src/modules/assessments/assignment.model.js";
import AssignmentSubmission from "../src/modules/assessments/assignmentSubmission.model.js";
import Progress from "../src/modules/progress/progress.model.js";
import Group from "../src/modules/social/group.model.js";
import Forum from "../src/modules/social/forum.model.js";
import Thread from "../src/modules/social/thread.model.js";
import Attendance from "../src/modules/attendance/attendance.model.js";

async function seed() {
    try {
        console.log("🚀 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected.");

        // 1. Get Core Data
        const abel = await User.findOne({ email: "abel@student.com" });
        const marta = await User.findOne({ email: "marta@student.com" });
        const admin = await User.findOne({ role: "admin" });
        const tutor = await User.findOne({ role: "tutor" });
        const math = await Subject.findOne({ title: /Calculus/i }) || await Subject.findOne();

        if (!abel || !admin || !tutor || !math) {
            console.error("❌ Missing required seed data (User, Admin, Tutor, or Subject). Please run connectDB seeding first.");
            process.exit(1);
        }

        console.log(`🎓 Found Student: ${abel.name} (Grade ${abel.grade})`);

        // 2. Seed Announcements
        console.log("📢 Seeding Announcements...");
        await Announcement.deleteMany({});
        await Announcement.create([
            {
                title: "Grade 12 National Exam Schedule",
                body: "The national exams for Grade 12 will begin on June 15th. Please check your dashboard for the detailed timetable.",
                category: "exam",
                targetGrade: "12",
                createdBy: admin._id,
                role: "admin"
            },
            {
                title: "New Advanced Physics Content",
                body: "I have uploaded new video lessons for Quantum Mechanics. Make sure to review them before the weekend quiz.",
                category: "academic",
                targetGrade: "12",
                targetTutor: tutor._id,
                createdBy: tutor._id,
                role: "tutor"
            },
            {
                title: "Holiday Announcement",
                body: "The school will be closed on Friday for the public holiday. Regular classes will resume on Monday.",
                category: "holiday",
                createdBy: admin._id,
                role: "admin"
            }
        ]);

        // 3. Seed Assessments (Quizzes)
        console.log("📝 Seeding Quizzes...");
        await Assessment.deleteMany({});
        const quiz1 = await Assessment.create({
            title: "Calculus Fundamentals Quiz",
            description: "Test your knowledge of derivatives and limits.",
            type: "quiz",
            subject: math._id,
            grade: "12",
            totalMarks: 10,
            passingMarks: 6,
            isPublished: true,
            createdBy: tutor._id,
            creationMethod: "ai",
            questions: [
                { question: "What is the derivative of x^2?", options: ["x", "2x", "x^2", "1"], correctAnswer: "2x", marks: 2 },
                { question: "Limit of 1/x as x approaches infinity?", options: ["0", "1", "Infinity", "Undefined"], correctAnswer: "0", marks: 2 }
            ]
        });

        // 4. Seed Attempts (Quiz Results)
        console.log("🏆 Seeding Quiz Attempts...");
        await Attempt.deleteMany({});
        await Attempt.create({
            user: abel._id,
            assessment: quiz1._id,
            score: 8,
            percentage: 80,
            passed: true,
            gradedAt: new Date(),
            submittedAt: new Date(Date.now() - 86400000),
            answers: []
        });

        // 5. Seed Assignments
        console.log("📂 Seeding Assignments...");
        await Assignment.deleteMany({});
        const assign1 = await Assignment.create({
            title: "Calculus Weekly Problem Set",
            description: "Complete all exercises in Chapter 3.",
            subject: math._id,
            tutor: tutor._id,
            maxMarks: 50,
            grade: "12",
            dueDate: new Date(Date.now() + 86400000 * 3) // 3 days from now
        });

        const assign2 = await Assignment.create({
            title: "Physics Lab Report",
            description: "Submit your findings on the photoelectric effect experiment.",
            subject: math._id,
            tutor: tutor._id,
            maxMarks: 100,
            grade: "12",
            dueDate: new Date(Date.now() - 86400000 * 2) // 2 days ago
        });

        // 6. Seed Assignment Submissions (Grades)
        console.log("📊 Seeding Grades...");
        await AssignmentSubmission.deleteMany({});
        await AssignmentSubmission.create({
            assignment: assign2._id,
            student: abel._id,
            content: "My completed lab report on the photoelectric effect.",
            status: "evaluated",
            marksObtained: 85,
            feedback: "Excellent analysis. Keep it up!"
        });

        // 7. Seed Progress
        console.log("📈 Seeding Progress...");
        await Progress.deleteMany({});
        await Progress.create({
            student: abel._id,
            subject: math._id,
            totalProgress: 65,
            completedLessons: [],
            completedAssessments: [quiz1._id],
            timeSpent: 12000 // 200 hours
        });

        // 8. Seed Study Groups (Squads)
        console.log("👥 Seeding Study Groups...");
        await Group.deleteMany({});
        const squad = await Group.create({
            name: "Physics Elites G12",
            topic: "Quantum Mechanics & Relativity",
            avatar: "⚛️",
            grade: 12,
            type: "academic",
            createdBy: abel._id,
            members: [abel._id, marta._id]
        });

        const squadForum = await Forum.create({
            group: squad._id,
            title: "Quantum Mechanics Discussion",
            description: "Ask anything about wave functions and state vectors here.",
            createdBy: abel._id
        });

        await Thread.create({
            forum: squadForum._id,
            title: "Help with Schrodinger Equation",
            content: "Can someone explain why the wave function must be continuous?",
            author: marta._id
        });

        // 9. Seed Attendance (For AI Insights)
        console.log("📅 Seeding Attendance...");
        await Attendance.deleteMany({ student: abel._id });
        const attendanceEntries = [];
        for (let i = 0; i < 18; i++) {
            const date = new Date(Date.now() - (i * 86400000));
            attendanceEntries.push({
                student: abel._id,
                subject: math._id,
                status: "present",
                session: "sess-" + date.toISOString().split('T')[0]
            });
        }
        await Attendance.insertMany(attendanceEntries);

        // 10. Update User Stats
        abel.points = 1250;
        abel.streak = 5;
        abel.rank = 3;
        abel.lastActive = new Date();
        await abel.save();

        console.log("✅ Dashboard Seeding Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
