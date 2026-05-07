import Progress from "./progress.model.js";
import Subject from "../courses/subject.model.js";
import Lesson from "../courses/lesson.model.js";
import Assessment from "../assessments/assessment.model.js";

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
        const totalLessons = await Lesson.countDocuments({ subject: progress.subject });
        const totalAssessments = await Assessment.countDocuments({ subject: progress.subject, isPublished: true });

        const totalItems = totalLessons + totalAssessments;
        if (totalItems === 0) {
            progress.totalProgress = 0;
            return;
        }

        const completedItems = progress.completedLessons.length + progress.completedAssessments.length;
        progress.totalProgress = Math.round((completedItems / totalItems) * 100);
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
