import { User } from './auth-utils';
import mockData from './mock-data.json';

/**
 * Manager utilities for administrative workflows with persistent state (localStorage).
 */

const DATA_KEY = 'smarttutor_mock_db';

/**
 * Initialize or get data from localStorage
 */
const getDb = () => {
    if (typeof window === 'undefined') return mockData;
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return mockData;
        }
    }
    // Initialize with static mock data if empty
    localStorage.setItem(DATA_KEY, JSON.stringify(mockData));
    return mockData;
};

/**
 * Update localStorage with new data
 */
const saveDb = (data: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
    }
};

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
