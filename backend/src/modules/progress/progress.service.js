import Progress from "./progress.model.js";
import Subject from "../courses/subject.model.js";
import Lesson from "../courses/lesson.model.js";
import Assessment from "../assessments/assessment.model.js";
import Assignment from "../assessments/assignment.model.js";

export class ProgressService {
    static async getProgress(studentId, subjectId = null) {
        const query = { student: studentId };
        if (subjectId) query.subject = subjectId;

        return await Progress.find(query)
            .populate("subject", "title thumbnail")
            .sort({ updatedAt: -1 });
    }

    static async markLessonComplete(studentId, subjectId, lessonId) {
        let progress = await Progress.findOne({ student: studentId, subject: subjectId });
        
        if (!progress) {
            progress = new Progress({ student: studentId, subject: subjectId });
        }

        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
            await this.calculateOverallProgress(progress);
        }

        progress.lastAccessedAt = new Date();
        return await progress.save();
    }

    static async updateProgressFromAssignment(studentId, subjectId, assignmentId) {
        return await this.markAssessmentComplete(studentId, subjectId, assignmentId);
    }

    static async markAssessmentComplete(studentId, subjectId, assessmentId) {
        let progress = await Progress.findOne({ student: studentId, subject: subjectId });
        
        if (!progress) {
            progress = new Progress({ student: studentId, subject: subjectId });
        }

        if (!progress.completedAssessments.includes(assessmentId)) {
            progress.completedAssessments.push(assessmentId);
            await this.calculateOverallProgress(progress);
        }

        progress.lastAccessedAt = new Date();
        return await progress.save();
    }

    static async calculateOverallProgress(progress) {
        // Count lessons
        const totalLessons = await Lesson.countDocuments({ subject: progress.subject });
        
        // Count assessments (automated quizzes)
        const totalAssessments = await Assessment.countDocuments({ 
            subject: progress.subject, 
            isPublished: true 
        });

        // Count assignments (manual tasks)
        const totalAssignments = await Assignment.countDocuments({
            subject: progress.subject
        });

        const totalItems = totalLessons + totalAssessments + totalAssignments;
        
        if (totalItems === 0) {
            progress.totalProgress = 0;
            return;
        }

        // Note: progress.completedAssessments currently stores both Assessment and Assignment IDs
        const completedItems = progress.completedLessons.length + progress.completedAssessments.length;
        progress.totalProgress = Math.min(100, Math.round((completedItems / totalItems) * 100));
        
        console.log(`[Progress Update] Student: ${progress.student}, Subject: ${progress.subject}, Progress: ${progress.totalProgress}%`);
    }

    static async updateTimeSpent(studentId, subjectId, minutes) {
        return await Progress.findOneAndUpdate(
            { student: studentId, subject: subjectId },
            { 
                $inc: { timeSpent: minutes },
                lastAccessedAt: new Date()
            },
            { new: true, upsert: true }
        );
    }
}
