import { getDb, saveDb } from './db-utils';
import { User } from './auth-utils';

/**
 * Student-specific utilities for academic tracking and enrollment.
 */

/**
 * Get enrolled courses for a specific student
 */
export const getEnrolledCourses = (studentId: string) => {
    const db = getDb();
    // In a real app, we'd have an enrollments table/array
    // For now, we return courses assigned to the student's grade
    const user = [...db.users.students, ...db.users.tutors].find((u: any) => u.id === studentId);
    if (!user || !user.grade) return [];

    return db.courses.filter((c: any) => c.grade === user.grade);
};

/**
 * Enroll a student in a course
 */
export const enrollInCourse = (studentId: string, courseId: string) => {
    const db = getDb();
    // Logic for enrollment (simulated as adding to an array)
    if (!db.enrollments) db.enrollments = [];

    const exists = db.enrollments.some((e: any) => e.studentId === studentId && e.courseId === courseId);
    if (!exists) {
        db.enrollments.push({
            id: `enr_${Date.now()}`,
            studentId,
            courseId,
            enrolledAt: new Date().toISOString()
        });
        saveDb(db);
        return true;
    }
    return false;
};

/**
 * Get student performance summary
 */
export const getStudentStats = (studentId: string) => {
    const db = getDb();
    // Mocked for now, but linked to studentId
    return {
        gpa: 3.8,
        attendance: 96,
        progress: 74,
        completedCourses: 12
    };
};
