import { getDb, saveDb } from './db-utils';

export type UserRole = 'student' | 'tutor' | 'admin' | 'manager';

/**
 * User interface representing the data contract between frontend and backend.
 */
export interface User {
    id: string;              // Unique identifier (e.g. std_1, tut_1, man_1)
    firstName: string;       // User's first name
    lastName: string;        // User's last name
    name: string;            // Full display name
    email: string;           // Login email
    role: UserRole;          // Role: student, tutor, admin, or manager
    grade?: string;          // Required for students (9, 10, 11, 12)
    degree?: string;         // Required for tutors
    experience?: number;     // Required for tutors (years)
    subject?: string;        // Required for tutors
    availability?: string[]; // Required for tutors (days of the week)
    isVerified: boolean;     // Whether the user's account is verified
    status?: 'pending' | 'approved' | 'rejected'; // For tutor approval workflow
    password?: string;       // Password (only used in mock logic)
    profileImage?: string;   // Optional profile image URL
}

/**
 * Mock authentication function for frontend
 */
export const loginUser = (email: string, password: string): User | { error: string } | null => {
    const db = getDb();

    const allUsers = [
        ...db.users.students,
        ...db.users.tutors,
        ...db.users.managers,
        ...(db.users.admins || [])
    ] as User[];

    // Find user with matching email and password
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        // Block pending/rejected tutors
        if (user.role === 'tutor' && user.status === 'pending') {
            return { error: 'Your application is currently being reviewed by our institutional board. We will notify you via email once approved.' };
        }
        if (user.role === 'tutor' && user.status === 'rejected') {
            return { error: 'Your application was not approved at this time. Please contact support for details.' };
        }

        // Save to localStorage to simulate session
        if (typeof window !== 'undefined') {
            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem('smarttutor_user', JSON.stringify(userWithoutPassword));
        }
        return user;
    }

    return null;
};

/**
 * Register a new user (mocked)
 */
export const registerUser = (userData: Partial<User>): User => {
    const newUser: User = {
        id: userData.role === 'tutor' ? `tut_${Math.random().toString(36).substr(2, 5)}` : `std_${Math.random().toString(36).substr(2, 5)}`,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email || '',
        role: userData.role as UserRole || 'student',
        isVerified: false,
        status: userData.role === 'tutor' ? 'pending' : 'approved',
        documents: userData.role === 'tutor' ? ['degree_certificate.pdf', 'national_id.pdf'] : [],
        ...userData
    } as User;

    if (typeof window !== 'undefined') {
        const db = getDb();

        if (newUser.role === 'student') {
            db.users.students.push(newUser);
        } else if (newUser.role === 'tutor') {
            db.users.tutors.push(newUser);

            // Add notification for managers
            if (!db.notifications) db.notifications = [];
            db.notifications.unshift({
                id: `notif_${Date.now()}`,
                title: 'New Tutor Application',
                message: `${newUser.name} has submitted a new application for ${newUser.subject}.`,
                time: 'Just now',
                type: 'alert',
                isRead: false
            });
        }

        saveDb(db);

        // For students, log them in immediately. For tutors, wait for approval.
        if (newUser.role === 'student') {
            const { password: _, ...userWithoutPassword } = newUser;
            localStorage.setItem('smarttutor_user', JSON.stringify(userWithoutPassword));
        }
    }

    return newUser;
};

/**
 * Get the currently logged-in user
 */
export const getCurrentUser = (): User | null => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('smarttutor_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
    }
    return null;
};

/**
 * Logout the user
 */
export const logoutUser = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('smarttutor_user');
    }
};
