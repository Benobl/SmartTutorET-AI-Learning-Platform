import { User, authApi } from './auth-utils';
import * as api from './api';
const { adminApi, userApi, courseApi, notificationApi, aiApi, schedulingApi } = api;
console.log("[DEBUG] schedulingApi loaded:", !!schedulingApi);
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Manager utilities for administrative workflows connected to the backend API.
 */

/**
 * Get all students
 */
export const getStudents = async (): Promise<User[]> => {
    try {
        const response = await userApi.getAllStudents();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch students:", error);
        return [];
    }
};

/**
 * Get all tutors (including pending)
 */
export const getAllTutors = async (): Promise<User[]> => {
    try {
        const response = await userApi.getAllTutors();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch tutors:", error);
        return [];
    }
};

/**
 * Get pending tutors for review
 */
export const getPendingTutors = async (): Promise<User[]> => {
    try {
        const response = await adminApi.getPendingTutors();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch pending tutors:", error);
        return [];
    }
};

/**
 * Get specific tutor by ID (Now fetches from backend via user list)
 */
export const getTutorById = async (id: string): Promise<User | undefined> => {
    try {
        const tutors = await getAllTutors();
        return tutors.find(t => t._id === id || t.id === id);
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch tutor by ID:", error);
        return undefined;
    }
};

/**
 * Get all jobs
 */
export const getJobs = async () => {
    try {
        const response = await adminApi.getJobs();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch jobs:", error);
        return [];
    }
};

/**
 * Get all courses
 */
export const getCourses = async () => {
    try {
        const response = await courseApi.getAll();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch courses:", error);
        return [];
    }
};

/**
 * AI-Powered Curriculum Generation
 */
export const generateGradeCurriculum = async (grade: string, stream: string) => {
    try {
        const response = await aiApi.generateGradeCurriculum(grade, stream);
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to generate curriculum:", error);
        return [];
    }
};

export const generateGradeSchedule = async (grade: string, stream: string, subjects: any[]) => {
    try {
        const response = await aiApi.generateGradeSchedule(grade, stream, subjects);
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to generate schedule:", error);
        return [];
    }
};

/**
 * Get master schedule (Backend-driven)
 */
export const getSchedules = async () => {
    try {
        const response = await schedulingApi.getAll();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch schedules:", error);
        return [];
    }
};

/**
 * Get system stats
 */
export const getSystemStats = async () => {
    try {
        const response = await adminApi.getStats();
        return response.data || { totalStudents: 0, totalTutors: 0, pendingTutors: 0, totalJobs: 0 };
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch system stats:", error);
        return { totalStudents: 0, totalTutors: 0, pendingTutors: 0, totalJobs: 0 };
    }
};

/**
 * Approve a tutor
 */
export const approveTutor = async (tutorId: string): Promise<boolean> => {
    try {
        const response = await adminApi.approveTutor(tutorId);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to approve tutor:", error);
        return false;
    }
};

/**
 * Reject a tutor
 */
export const rejectTutor = async (tutorId: string, reason?: string): Promise<boolean> => {
    try {
        const response = await adminApi.rejectTutor(tutorId, reason);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to reject tutor:", error);
        return false;
    }
};

/**
 * Delete a job vacancy
 */
export const deleteJob = async (jobId: string): Promise<boolean> => {
    try {
        const response = await adminApi.deleteJob(jobId);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to delete job:", error);
        return false;
    }
};

/**
 * Post a new job
 */
export const postJob = async (job: any): Promise<boolean> => {
    try {
        const response = await adminApi.createJob(job);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to post job:", error);
        return false;
    }
};

/**
 * Course Management
 */
export const addCourse = async (course: any) => {
    try {
        const response = await courseApi.create(course);
        return response.data;
    } catch (error) {
        console.error("[ManagerUtils] Failed to create course:", error);
        return null;
    }
};

export const updateCourse = async (id: string, updates: any) => {
    try {
        const response = await courseApi.update(id, updates);
        return response.data;
    } catch (error) {
        console.error("[ManagerUtils] Failed to update course:", error);
        return null;
    }
};

export const deleteCourse = async (id: string) => {
    try {
        const response = await courseApi.delete(id);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to delete course:", error);
        return false;
    }
};

/**
 * Master Schedule Management (Backend-driven)
 */
export const getMasterSchedules = async () => {
    try {
        const response = await schedulingApi.getAll();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch master schedule:", error);
        return [];
    }
};

export const getGradeSchedule = async (grade: string) => {
    try {
        const response = await schedulingApi.getByGrade(grade);
        return response.data || [];
    } catch (error) {
        console.error(`[ManagerUtils] Failed to fetch schedule for grade ${grade}:`, error);
        return [];
    }
};

export const addScheduleEntry = async (entry: any) => {
    try {
        const response = await schedulingApi.create(entry);
        return response.data;
    } catch (error) {
        console.error("[ManagerUtils] Failed to create schedule entry:", error);
        return null;
    }
};

export const deleteScheduleEntry = async (id: string) => {
    try {
        const response = await schedulingApi.delete(id);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to delete schedule entry:", error);
        return false;
    }
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
 * Get all database for full export (Now aggregates real collections)
 */
export const getFullExportData = async () => {
    try {
        const [users, jobs, courses, schedules] = await Promise.all([
            getUsers(),
            getJobs(),
            getCourses(),
            getMasterSchedules()
        ]);
        return { users, jobs, courses, schedules };
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch full export data:", error);
        return {};
    }
};

/**
 * Notifications Management
 */
export const getNotifications = async () => {
    try {
        const response = await notificationApi.getMine();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch notifications:", error);
        return [];
    }
};

export const markNotificationAsRead = async (id: string) => {
    try {
        const response = await notificationApi.markAsRead(id);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to mark notification as read:", error);
        return false;
    }
};

export const clearNotifications = async () => {
    try {
        const response = await notificationApi.markAllAsRead();
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to clear notifications:", error);
        return false;
    }
};

/**
 * Subject Approval
 */
export const getPendingSubjects = async () => {
    try {
        const response = await adminApi.getPendingSubjects();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch pending subjects:", error);
        return [];
    }
};

export const approveSubject = async (id: string) => {
    try {
        const response = await adminApi.approveSubject(id);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to approve subject:", error);
        return false;
    }
};

export const rejectSubject = async (id: string, feedback?: string) => {
    try {
        const response = await adminApi.rejectSubject(id, feedback);
        return response.success;
    } catch (error) {
        console.error("[ManagerUtils] Failed to reject subject:", error);
        return false;
    }
};

/**
 * User & Progress Monitoring
 */
export const getUsers = async () => {
    try {
        const response = await adminApi.getUsers();
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch users:", error);
        return [];
    }
};

export const getStudentProgress = async (studentId: string) => {
    try {
        const response = await adminApi.getStudentProgress(studentId);
        return response.data || [];
    } catch (error) {
        console.error("[ManagerUtils] Failed to fetch student progress:", error);
        return [];
    }
};
