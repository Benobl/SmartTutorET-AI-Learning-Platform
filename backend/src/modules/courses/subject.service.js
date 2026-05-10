import Subject from "./subject.model.js";
import LiveSession from "../live/live.model.js";
import { ApiError } from "../../middleware/error.middleware.js";
import mongoose from "mongoose";
import Payment from "../payments/payment.model.js";
import Assignment from "../assessments/assignment.model.js";
import AssignmentSubmission from "../assessments/assignmentSubmission.model.js";
import User from "../users/user.model.js";
import CourseContent from "./courseContent.model.js";
import Video from "./video.model.js";
import PDF from "./pdf.model.js";
import YouTubeLink from "./youtubeLink.model.js";
import Quiz from "./quiz.model.js";
import Exercise from "./exercise.model.js";

export class SubjectService {
    static async createSubject(tutor, subjectData) {
        return await Subject.create({
            ...subjectData,
            tutor
        });
    }

    static async enrollStudent(subjectId, studentId) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");

        if (subject.status !== "approved") {
            throw new ApiError(400, "This subject is pending review and cannot accept enrollments yet.");
        }

        if (subject.students.some(s => s.toString() === studentId.toString())) {
            throw new ApiError(400, "Student already enrolled in this subject");
        }

        subject.students.push(studentId);
        await subject.save();

        // Notify Tutor
        const { NotificationService } = await import("../notifications/notification.service.js");
        await NotificationService.notifyEnrolledStudents({ 
            students: [subject.tutor], 
            title: subject.title 
        }, `A new student has enrolled in your course: ${subject.title}`, "new_enrollment");

        return subject;
    }

    static async getSubjectDetails(subjectId, userId = null) {
        const subject = await Subject.findById(subjectId)
            .populate("tutor", "name email profile.avatar")
            .populate("students", "name");
        
        if (!subject) return null;

        const data = subject.toObject();
        
        if (userId) {
            const user = await User.findById(userId);
            
            const isEnrolled = subject.students.some(s => s._id.toString() === userId.toString());
            const isGradeMatch = user && String(user.grade) === String(subject.grade);
            
            data.isEnrolled = isEnrolled || (subject.isFree && isGradeMatch);
        }

        return data;
    }

    static async createLiveSession(subject, sessionData) {
        return await LiveSession.create({
            ...sessionData,
            subject
        });
    }
    static async getAllSubjects(query = {}) {
        const finalQuery = { status: "approved", ...query };
        return await Subject.find(finalQuery).populate("tutor", "name profile.avatar");
    }

    static async updateSubject(subjectId, updates) {
        const subject = await Subject.findByIdAndUpdate(subjectId, updates, { new: true });
        if (!subject) throw new ApiError(404, "Subject not found");
        return subject;
    }

    static async deleteSubject(subjectId) {
        const subject = await Subject.findByIdAndDelete(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");
        return subject;
    }

    static async getRecommended(user) {
        const query = { status: "approved" };
        
        if (user.grade) {
            query.grade = user.grade;
        }
        
        // Return premium and common subjects for their grade
        return await Subject.find(query)
            .sort({ isPremium: -1, createdAt: -1 })
            .limit(10)
            .populate("tutor", "name profile.avatar");
    }

    static async getMySubjects(userId, role) {
        if (role === "student") {
            const User = (await import("../users/user.model.js")).default;
            const student = await User.findById(userId);
            const studentGrade = student?.grade;

            // Get explicitly enrolled subjects
            const enrolledSubjects = await Subject.find({ students: userId }).populate("tutor", "name profile.avatar");

            // Get free common subjects for this grade
            let freeCommonSubjects = [];
            const freeCommonFilter = {
                isPremium: false,
                status: { $in: ["approved", "pending"] },
                students: { $ne: userId }, // Don't duplicate if already enrolled
            };
            if (studentGrade) {
                freeCommonFilter.grade = parseInt(studentGrade);
            }
            freeCommonSubjects = await Subject.find(freeCommonFilter).populate("tutor", "name profile.avatar");

            // De-duplicate by subject id
            const subjectMap = new Map();
            [...enrolledSubjects, ...freeCommonSubjects].forEach((subject) => {
                subjectMap.set(String(subject._id), subject);
            });
            return Array.from(subjectMap.values());
        } else if (role === "tutor" || role === "manager" || role === "admin") {
            const query = role === "tutor" ? { tutor: userId } : {};
            return await Subject.find(query).populate("tutor", "name profile.avatar").populate("students", "name profile.avatar");
        }
        return [];
    }

    static async getTutorStudents(tutorId) {
        const tid = mongoose.Types.ObjectId.isValid(tutorId) ? new mongoose.Types.ObjectId(tutorId) : tutorId;
        
        // Use lean for performance and plain objects
        const subjects = await Subject.find({ tutor: tid })
            .select("_id title grade students isPremium status")
            .populate("students", "name email profile.avatar grade")
            .lean();

        // All grades where this tutor teaches at least one approved free/common subject.
        // Any student registered in that grade should appear in the tutor roster
        // (premium subjects still require explicit enrollment/payment).
        const freeTeachingGrades = new Set(
            subjects
                .filter((s) => s && !s.isPremium && s.status === "approved" && s.grade != null)
                .map((s) => String(s.grade))
        );

        // Prefetch all students in those grades (for automatic free/common access)
        const gradeRosterStudents = freeTeachingGrades.size
            ? await User.find({
                role: "student",
                grade: { $in: Array.from(freeTeachingGrades).map((g) => Number(g)) },
                accountStatus: { $ne: "deactivated" },
            })
                  .select("_id name email profile.avatar grade")
                  .lean()
            : [];

        const tutorStudents = [];
        const seenCombinations = new Set();

        // 1) REAL enrolled students (Subject.students)
        for (const subject of subjects) {
            const subjectId = subject?._id?.toString();
            if (!subjectId) continue;

            const subjectStudents = Array.isArray(subject.students) ? subject.students : [];
            for (const student of subjectStudents) {
                if (!student?._id) continue;

                const studentId = student._id.toString();
                const comboKey = `${studentId}-${subjectId}`;
                if (seenCombinations.has(comboKey)) continue;

                tutorStudents.push({
                    _id: studentId,
                    name: student.name,
                    email: student.email,
                    profile: student.profile,
                    grade: student.grade ?? subject.grade,
                    course: subject.title,
                    subjectId,
                    enrollmentType: "explicit",
                    average: null,
                });

                seenCombinations.add(comboKey);
            }
        }

        // 1b) Automatic roster students for free/common courses (grade-based)
        // Add them as "free_common" course associations, even without explicit enrollment.
        // (Premium is excluded here.)
        const freeApprovedByGrade = new Map(); // gradeStr -> [{subjectId,title,grade,isPremium,status}]
        for (const s of subjects) {
            if (!s || s.isPremium) continue;
            if (s.status !== "approved") continue;
            const g = String(s.grade ?? "");
            if (!g) continue;
            const list = freeApprovedByGrade.get(g) || [];
            list.push({
                subjectId: s._id.toString(),
                title: s.title,
                grade: s.grade,
                average: null,
                enrollmentType: "free_common",
            });
            freeApprovedByGrade.set(g, list);
        }

        for (const student of gradeRosterStudents) {
            const studentId = student?._id?.toString();
            const gradeStr = String(student?.grade ?? "");
            if (!studentId || !gradeStr) continue;

            const eligible = freeApprovedByGrade.get(gradeStr) || [];
            for (const c of eligible) {
                const comboKey = `${studentId}-${c.subjectId}`;
                if (seenCombinations.has(comboKey)) continue;

                tutorStudents.push({
                    _id: studentId,
                    name: student.name,
                    email: student.email,
                    profile: student.profile ? { avatar: student.profile.avatar } : { avatar: "" },
                    grade: student.grade,
                    course: c.title,
                    subjectId: c.subjectId,
                    enrollmentType: "free_common",
                    average: null,
                });
                seenCombinations.add(comboKey);
            }
        }

        // 2) Paid enrollments (completed payments) as a safety net
        // This covers cases where payment was completed but subject.students wasn't updated
        // due to missed callback/verify flow.
        const subjectIds = subjects
            .map((s) => s?._id)
            .filter(Boolean);

        if (subjectIds.length > 0) {
            const paid = await Payment.find({
                subject: { $in: subjectIds },
                status: "completed",
            })
                .populate("student", "name email profile.avatar grade")
                .populate("subject", "title grade")
                .lean();

            for (const p of paid) {
                const subject = p.subject;
                const student = p.student;
                const subjectId = subject?._id?.toString();
                const studentId = student?._id?.toString();
                if (!subjectId || !studentId) continue;

                const comboKey = `${studentId}-${subjectId}`;
                if (seenCombinations.has(comboKey)) continue;

                tutorStudents.push({
                    _id: studentId,
                    name: student.name,
                    email: student.email,
                    profile: student.profile,
                    grade: student.grade ?? subject.grade,
                    course: subject.title,
                    subjectId,
                    enrollmentType: "payment_completed",
                    average: null,
                });

                seenCombinations.add(comboKey);
            }
        }

        // 3) Real average from evaluated assignment submissions (per student per subject)
        // Compute a weighted average percentage for each (studentId, subjectId).
        // If there are no evaluated submissions, average will remain undefined.
        const uniqueSubjectIds = [...new Set(tutorStudents.map((s) => s.subjectId))];
        const uniqueStudentIds = [...new Set(tutorStudents.map((s) => s._id))];

        if (uniqueSubjectIds.length > 0 && uniqueStudentIds.length > 0) {
            const assignments = await Assignment.find({
                subject: { $in: uniqueSubjectIds },
                tutor: tid,
            })
                .select("_id subject maxMarks weight")
                .lean();

            const assignmentById = new Map(
                assignments.map((a) => [
                    a._id.toString(),
                    {
                        subjectId: a.subject.toString(),
                        maxMarks: Number(a.maxMarks) || 100,
                        weight: Number(a.weight) || 1,
                    },
                ])
            );

            const assignmentIds = assignments.map((a) => a._id);
            if (assignmentIds.length > 0) {
                const submissions = await AssignmentSubmission.find({
                    assignment: { $in: assignmentIds },
                    student: { $in: uniqueStudentIds },
                    status: "evaluated",
                    marksObtained: { $ne: null },
                })
                    .select("assignment student marksObtained")
                    .lean();

                const agg = new Map(); // key = `${studentId}-${subjectId}` -> { weightedSum, weightSum }
                for (const sub of submissions) {
                    const a = assignmentById.get(sub.assignment.toString());
                    if (!a) continue;
                    const studentId = sub.student.toString();
                    const subjectId = a.subjectId;
                    const key = `${studentId}-${subjectId}`;

                    const max = a.maxMarks > 0 ? a.maxMarks : 100;
                    const raw = Number(sub.marksObtained);
                    if (Number.isNaN(raw)) continue;

                    const pct = Math.max(0, Math.min(100, (raw / max) * 100));
                    const w = a.weight > 0 ? a.weight : 1;

                    const prev = agg.get(key) || { weightedSum: 0, weightSum: 0 };
                    prev.weightedSum += pct * w;
                    prev.weightSum += w;
                    agg.set(key, prev);
                }

                for (const row of tutorStudents) {
                    const key = `${row._id}-${row.subjectId}`;
                    const v = agg.get(key);
                    if (v && v.weightSum > 0) {
                        row.average = Math.round(v.weightedSum / v.weightSum);
                    }
                }
            }
        }

        // Deduplicate: one row per student, with a courses[] list
        const byStudent = new Map(); // studentId -> aggregated row
        for (const row of tutorStudents) {
            const studentId = row._id;
            if (!studentId) continue;

            const existing = byStudent.get(studentId);
            const courseEntry = {
                subjectId: row.subjectId,
                title: row.course,
                grade: row.grade,
                average: typeof row.average === "number" ? row.average : null,
                enrollmentType: row.enrollmentType,
            };

            if (!existing) {
                byStudent.set(studentId, {
                    _id: row._id,
                    name: row.name,
                    email: row.email,
                    profile: row.profile,
                    grade: row.grade,
                    courses: [courseEntry],
                    // helpful display field
                    course: row.course,
                    // overall average across courses with averages
                    average: typeof row.average === "number" ? row.average : null,
                });
            } else {
                existing.courses.push(courseEntry);
                existing.course = existing.courses.map((c) => c.title).filter(Boolean).join(", ");

                // If multiple course averages exist, compute overall mean
                const avgs = existing.courses.map((c) => c.average).filter((v) => typeof v === "number");
                existing.average = avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null;
            }
        }

        return Array.from(byStudent.values());
    }
    static async addLesson(subjectId, lessonData) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");
        
        subject.lessons.push(lessonData);
        await subject.save();

        // Notify students
        const { NotificationService } = await import("../notifications/notification.service.js");
        await NotificationService.notifyEnrolledStudents(
            subject, 
            `New lesson added to ${subject.title}: "${lessonData.title}"`,
            "new_lesson"
        );

        return subject;
    }

    static async autoGenerateLessons(subjectId) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new ApiError(404, "Subject not found");
        
        const { AIService } = await import("../ai/ai.service.js");
        const resources = await AIService.suggestResources(subject.title, subject.grade);
        
        const newLessons = resources.videos.map(vid => ({
            title: vid.title,
            videoUrl: vid.url,
            duration: "20 min",
            type: "video"
        }));
        
        subject.lessons.push(...newLessons);
        await subject.save();

        // Notify students
        const { NotificationService } = await import("../notifications/notification.service.js");
        await NotificationService.notifyEnrolledStudents(
            subject, 
            `AI has curated ${newLessons.length} new lessons for ${subject.title}! Check them out now.`,
            "ai_curation"
        );

        return subject;
    }

    static async enrollStudentByEmail(tutorId, subjectId, studentEmail) {
        const subject = await Subject.findOne({ _id: subjectId, tutor: tutorId });
        if (!subject) throw new ApiError(403, "You can only add students to your own subjects.");

        const User = (await import("../users/user.model.js")).default;
        const student = await User.findOne({ email: studentEmail.toLowerCase(), role: "student" });
        if (!student) throw new ApiError(404, "Student with this email not found. Please ensure they have a student account.");

        if (subject.students.includes(student._id)) {
            throw new ApiError(400, "Student is already enrolled in this subject.");
        }

        subject.students.push(student._id);
        await subject.save();

        return student;
    }

    static async addCourseContent(courseId, tutorId, contentData) {
        const { category, title, description, ...details } = contentData;
        
        let content;
        let categoryModel;

        switch (category) {
            case "Video":
                content = await Video.create(details);
                categoryModel = "Video";
                break;
            case "PDF":
                content = await PDF.create(details);
                categoryModel = "PDF";
                break;
            case "YouTube":
                content = await YouTubeLink.create(details);
                categoryModel = "YouTubeLink";
                break;
            case "Quiz":
                content = await Quiz.create(details);
                categoryModel = "Quiz";
                break;
            case "Exercise":
                content = await Exercise.create(details);
                categoryModel = "Exercise";
                break;
            default:
                throw new ApiError(400, "Invalid content category");
        }

        const courseContent = await CourseContent.create({
            course: courseId,
            tutor: tutorId,
            title,
            description,
            category,
            contentId: content._id,
            categoryModel
        });

        // Sync with legacy lessons array if needed (optional, for backward compatibility)
        const subject = await Subject.findById(courseId);
        if (subject) {
            const legacyLesson = {
                title,
                type: category.toLowerCase() === "youtube" ? "video" : category.toLowerCase(),
                videoUrl: details.url || details.videoUrl || (details.videoId ? `https://www.youtube.com/watch?v=${details.videoId}` : null),
                pptUrl: details.url || details.content_url,
                exerciseUrl: details.url || details.content_url,
                content: details.content
            };
            subject.lessons.push(legacyLesson);
            await subject.save();
        }

        return courseContent;
    }

    static async getCourseContent(courseId, userId = null, role = null) {
        // If userId is provided, check if student is enrolled or if user is the tutor
        if (userId && role === "student") {
            const subject = await Subject.findById(courseId);
            if (!subject) throw new ApiError(404, "Subject not found");
            
            const isEnrolled = subject.students.some(s => s.toString() === userId.toString());
            if (!isEnrolled && !subject.isFree) {
                // Return only free content if not enrolled
                return await CourseContent.find({ course: courseId, isFree: true })
                    .populate("contentId")
                    .sort({ order: 1, createdAt: 1 });
            }
        }

        return await CourseContent.find({ course: courseId })
            .populate("contentId")
            .sort({ order: 1, createdAt: 1 });
    }

    static async deleteCourseContent(contentId, tutorId) {
        const content = await CourseContent.findOne({ _id: contentId, tutor: tutorId });
        if (!content) throw new ApiError(404, "Content not found or unauthorized");

        // Delete the specific type model entry
        const Model = mongoose.model(content.categoryModel);
        await Model.findByIdAndDelete(content.contentId);

        // Delete the base content entry
        await CourseContent.findByIdAndDelete(contentId);
        
        return { success: true };
    }
}
