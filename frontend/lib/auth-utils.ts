import { authApi } from './api';

export type UserRole = 'student' | 'tutor' | 'admin' | 'manager';

/**
 * User interface representing the data contract between frontend and backend.
 */
export interface User {
    _id: string;             // Unique identifier from MongoDB
    firstName: string;       // User's first name
    lastName: string;        // User's last name
    fullName: string;        // Full display name
    email: string;           // Login email
    role: UserRole;          // Role: student, tutor, admin, or manager
    grade?: string;          // Required for students (9, 10, 11, 12)
    degree?: string;         // Required for tutors
    experience?: number;     // Required for tutors (years)
    subject?: string;        // Required for tutors
    availability?: string[]; // Required for tutors (days of the week)
    isVerified: boolean;     // Whether the user's account is verified
    tutorStatus: 'none' | 'pending' | 'approved' | 'rejected'; // For tutor approval workflow
    profilePic?: string;     // Optional profile image URL
}

/**
 * Real authentication function for frontend
 */
export const loginUser = async (email: string, password: string): Promise<User | { error: string }> => {
    try {
        const response = await authApi.login({ email, password });
        if (response.success && response.data) {
            const user = response.data;

            // Block pending/rejected tutors if the API doesn't handle it already
            if (user.role === 'tutor' && user.tutorStatus === 'pending') {
                return { error: 'Your application is currently being reviewed by our institutional board. We will notify you via email once approved.' };
            }
            if (user.role === 'tutor' && user.tutorStatus === 'rejected') {
                return { error: 'Your application was not approved at this time. Please contact support for details.' };
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('smarttutor_user', JSON.stringify(user));
            }
            return user;
        }
        return { error: response.message || "Invalid email or password" };
    } catch (error: any) {
        return { error: error.message || "An error occurred during login." };
    }
};

/**
 * Register a new user
 */
export const registerUser = async (userData: any): Promise<User | { error: string }> => {
    try {
        // Backend expects `fullName` but signup form sends `firstName` + `lastName`
        const payload = {
            ...userData,
            fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.fullName,
        };

        const response = await authApi.signup(payload);
        if (response.success && response.data) {
            const user = response.data;

            if (typeof window !== 'undefined' && user.role === 'student') {
                localStorage.setItem('smarttutor_user', JSON.stringify(user));
            }
            return user;
        }
        return { error: response.message || "Registration failed" };
    } catch (error: any) {
        return { error: error.message || "An error occurred during registration." };
    }
};

/**
 * Get the currently logged-in user (from storage or fresh from API)
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
export const logoutUser = async () => {
    try {
        await authApi.logout();
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('smarttutor_user');
            localStorage.removeItem('token'); // Also clean up token if stored
        }
    }
};
