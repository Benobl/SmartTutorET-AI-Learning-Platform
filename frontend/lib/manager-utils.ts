import { User } from './auth-utils';
import { getDb, saveDb } from './db-utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Manager utilities for administrative workflows with persistent state (localStorage).
 */

/**
 * Get all students
 */
export const getStudents = (): User[] => {
    const db = getDb();
    return db.users.students as User[];
};

/**
 * Get all tutors (including pending)
 */
export const getAllTutors = (): User[] => {
    const db = getDb();
    return db.users.tutors as User[];
};

/**
 * Get pending tutors for review
 */
export const getPendingTutors = (): User[] => {
    const db = getDb();
    return (db.users.tutors as User[]).filter(t => t.status === 'pending');
};

/**
 * Get specific tutor by ID
 */
export const getTutorById = (id: string): User | undefined => {
    const db = getDb();
    return (db.users.tutors as User[]).find(t => t.id === id);
};

/**
 * Get all jobs
 */
export const getJobs = () => {
    const db = getDb();
    return db.jobs;
};

/**
 * Get all courses
 */
export const getCourses = () => {
    const db = getDb();
    return db.courses;
};

/**
 * Get master schedule
 */
export const getSchedules = () => {
    const db = getDb();
    return db.schedules;
};

/**
 * Get system stats
 */
export const getSystemStats = () => {
    const db = getDb();
    return db.systemStats;
};

/**
 * Approve a tutor
 */
export const approveTutor = (tutorId: string): boolean => {
    const db = getDb();
    const tutorIndex = db.users.tutors.findIndex((t: any) => t.id === tutorId);
    if (tutorIndex !== -1) {
        db.users.tutors[tutorIndex].status = 'approved';
        saveDb(db);
        return true;
    }
    return false;
};

/**
 * Reject a tutor
 */
export const rejectTutor = (tutorId: string): boolean => {
    const db = getDb();
    const tutorIndex = db.users.tutors.findIndex((t: any) => t.id === tutorId);
    if (tutorIndex !== -1) {
        db.users.tutors[tutorIndex].status = 'rejected';
        saveDb(db);
        return true;
    }
    return false;
};

/**
 * Delete a job vacancy
 */
export const deleteJob = (jobId: string): boolean => {
    const db = getDb();
    const initialLength = db.jobs.length;
    db.jobs = db.jobs.filter((j: any) => j.id !== jobId);
    if (db.jobs.length < initialLength) {
        saveDb(db);
        return true;
    }
    return false;
};

/**
 * Post a new job
 */
export const postJob = (job: any): boolean => {
    const db = getDb();
    const newJob = {
        ...job,
        id: `job_${Date.now()}`,
        status: 'active',
        postedAt: new Date().toISOString().split('T')[0],
        applicantsCount: 0
    };
    db.jobs.push(newJob);
    saveDb(db);
    return true;
};

/**
 * Course Management
 */
export const addCourse = (course: any) => {
    const db = getDb();
    const newCourse = {
        ...course,
        id: `course_${Date.now()}`,
        studentCount: 0
    };
    db.courses.push(newCourse);
    saveDb(db);
    return newCourse;
};

export const updateCourse = (id: string, updates: any) => {
    const db = getDb();
    const idx = db.courses.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
        db.courses[idx] = { ...db.courses[idx], ...updates };
        saveDb(db);
        return true;
    }
    return false;
};

export const deleteCourse = (id: string) => {
    const db = getDb();
    db.courses = db.courses.filter((c: any) => c.id !== id);
    saveDb(db);
};

/**
 * Schedule Management
 */
export const addScheduleEntry = (entry: any) => {
    const db = getDb();
    const newEntry = {
        ...entry,
        id: `sch_${Date.now()}`,
        type: entry.type || 'regular',
        isOnline: true,
        room: entry.room || 'Virtual Hub A',
        startTime: entry.startTime || '08:00',
        endTime: entry.endTime || '09:30'
    };
    db.schedules.push(newEntry);
    saveDb(db);
    return newEntry;
};

export const deleteScheduleEntry = (id: string) => {
    const db = getDb();
    db.schedules = db.schedules.filter((s: any) => s.id !== id);
    saveDb(db);
};

/**
 * Enhanced PDF Export Utility
 */
export const exportToPDF = (data: any[], columns: string[], title: string, fileName: string) => {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Blue-500
    doc.text('SmartTutorET', 14, 22);

    doc.setFontSize(16);
    doc.setTextColor(100);
    doc.text(title, 14, 32);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

    // Table
    autoTable(doc, {
        startY: 45,
        head: [columns.map(c => c.toUpperCase())],
        body: data.map(row => columns.map(col => row[col] || '-')),
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 45 },
    });

    doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Functional report export (Legacy JSON)
 */
export const exportReport = (data: any, fileName: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Get all database for full export
 */
export const getFullExportData = () => {
    return getDb();
};

/**
 * Notifications Management
 */
export const getNotifications = () => {
    const db = getDb();
    if (!db.notifications) {
        db.notifications = [
            {
                id: '1',
                title: 'New Tutor Application',
                message: 'Dr. Aster Gebre submitted a new application for Biology.',
                time: '2 hours ago',
                type: 'alert',
                isRead: false
            },
            {
                id: '2',
                title: 'System Update',
                message: 'Curriculum registry has been synchronized with the master timeline.',
                time: '5 hours ago',
                type: 'info',
                isRead: true
            }
        ];
        saveDb(db);
    }
    return db.notifications;
};

export const markNotificationAsRead = (id: string) => {
    const db = getDb();
    const idx = db.notifications.findIndex((n: any) => n.id === id);
    if (idx !== -1) {
        db.notifications[idx].isRead = true;
        saveDb(db);
        return true;
    }
    return false;
};

export const clearNotifications = () => {
    const db = getDb();
    db.notifications = [];
    saveDb(db);
    return true;
};
