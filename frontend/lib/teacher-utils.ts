import { getDb, saveDb } from './db-utils';
import { User } from './auth-utils';

/**
 * Teacher-specific utilities for course management and instructional workflows.
 */

/**
 * Get courses taught by a specific teacher
 */
export const getTeacherCourses = (teacherId: string) => {
    const db = getDb();
    // Logic to find courses assigned to this tutor
    return db.courses.filter((c: any) => c.tutorId === teacherId || c.tutor === teacherId);
};

/**
 * Get pending assignments to grade
 */
export const getPendingSubmissions = (teacherId: string) => {
    const db = getDb();
    // Simulate finding submissions for this teacher's courses
    return db.submissions?.filter((s: any) => s.status === 'submitted') || [];
};

/**
 * Grade a student's submission
 */
export const gradeStudent = (submissionId: string, grade: number, feedback: string) => {
    const db = getDb();
    if (!db.submissions) return false;

    const idx = db.submissions.findIndex((s: any) => s.id === submissionId);
    if (idx !== -1) {
        db.submissions[idx].status = 'graded';
        db.submissions[idx].grade = grade;
        db.submissions[idx].feedback = feedback;
        saveDb(db);
        return true;
    }
    return false;
};

/**
 * Post an announcement to teacher's courses
 */
export const teacherPostAnnouncement = (teacherId: string, announcement: any) => {
    const db = getDb();
    if (!db.announcements) db.announcements = [];

    const newAnnouncement = {
        ...announcement,
        id: `ann_${Date.now()}`,
        authorId: teacherId,
        date: new Date().toISOString(),
        isRead: false
    };

    db.announcements.unshift(newAnnouncement);
    saveDb(db);
    return newAnnouncement;
};
