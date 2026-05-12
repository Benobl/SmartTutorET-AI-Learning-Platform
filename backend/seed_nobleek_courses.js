import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';
import Subject from './src/modules/courses/subject.model.js';
import Assignment from './src/modules/assessments/assignment.model.js';
import Assessment from './src/modules/assessments/assessment.model.js';
import dotenv from 'dotenv';
dotenv.config();

const NOBLEEK_ID = "6a0306cefd743283549c15d3";

const subjectsData = [
    "Mathematics", "Physics", "Chemistry", "Biology", "English", 
    "Amharic", "Geography", "History", "IT", "Citizenship"
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Ensure Nobleek is approved tutor
        await User.findByIdAndUpdate(NOBLEEK_ID, {
            role: 'tutor',
            tutorStatus: 'approved',
            isApproved: true
        });
        console.log('Tutor Nobleek updated/verified');

        // 2. Create another dummy tutor for dropdown testing
        let dummyTutor = await User.findOne({ email: 'dummy.tutor@example.com' });
        if (!dummyTutor) {
            dummyTutor = await User.create({
                name: 'Standardized Instructor',
                email: 'dummy.tutor@example.com',
                password: 'password123',
                role: 'tutor',
                tutorStatus: 'approved',
                isApproved: true,
                isVerified: true
            });
            console.log('Dummy tutor created');
        }

        // 3. Create Courses for Grade 9 and 10
        for (const grade of [9, 10]) {
            console.log(`Seeding Grade ${grade}...`);
            for (const subName of subjectsData) {
                const title = `${subName} - Grade ${grade}`;
                
                // Check if exists
                let subject = await Subject.findOne({ title, grade });
                if (!subject) {
                    subject = await Subject.create({
                        title,
                        description: `Comprehensive ${subName} course for Ethiopian Grade ${grade} curriculum.`,
                        tutor: NOBLEEK_ID,
                        grade,
                        category: subName === "Mathematics" ? "Mathematics" : 
                                  ["Physics", "Chemistry", "Biology"].includes(subName) ? "Science" : "Humanities",
                        status: "approved",
                        price: 0,
                        isPremium: false,
                        stream: "Common",
                        semester: "Full Year",
                        roadmap: {
                            semester1: { chapters: ["Chapter 1", "Chapter 2", "Chapter 3"], midTermDate: "2026-11-15", finalDate: "2027-01-20" },
                            semester2: { chapters: ["Chapter 4", "Chapter 5", "Chapter 6"], midTermDate: "2027-04-15", finalDate: "2027-06-20" }
                        }
                    });
                    console.log(`Created course: ${title}`);
                }

                // 4. Create Assignments for each subject
                const assignmentTitles = ["Introduction Assignment", "Chapter 1 Quiz", "Mid-Term Project"];
                for (const aTitle of assignmentTitles) {
                    const existingAss = await Assignment.findOne({ title: `${aTitle} - ${title}`, subject: subject._id });
                    if (!existingAss) {
                        await Assignment.create({
                            subject: subject._id,
                            tutor: NOBLEEK_ID,
                            title: `${aTitle} - ${title}`,
                            description: `Please complete the ${aTitle} for ${title}.`,
                            maxMarks: 100,
                            grade: grade.toString(),
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                            type: aTitle.includes("Quiz") ? "quiz" : "assignment"
                        });
                    }
                }

                // 5. Create Assessments for each subject
                const assessmentTypes = ["quiz", "exam"];
                for (const type of assessmentTypes) {
                    const aTitle = `${type === "quiz" ? "Weekly Quiz" : "Monthly Exam"} - ${title}`;
                    const existingAssess = await Assessment.findOne({ title: aTitle, subject: subject._id });
                    if (!existingAssess) {
                        await Assessment.create({
                            subject: subject._id,
                            grade: grade.toString(),
                            title: aTitle,
                            description: `Standardized ${type} for ${subName}.`,
                            type,
                            questions: [
                                {
                                    question: `What is the main concept of ${subName} Chapter 1?`,
                                    options: ["Option A", "Option B", "Option C", "Option D"],
                                    correctAnswer: "Option A",
                                    explanation: "Detailed explanation of why Option A is correct.",
                                    marks: 10
                                }
                            ],
                            totalMarks: 10,
                            passingMarks: 5,
                            isPublished: true,
                            createdBy: NOBLEEK_ID,
                            creationMethod: "manual",
                            isOfficial: true
                        });
                    }
                }
            }
        }

        console.log('Seeding completed successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
}

seed();
