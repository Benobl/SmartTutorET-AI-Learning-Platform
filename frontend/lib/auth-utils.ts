import { authApi } from './api';

export type UserRole = 'student' | 'tutor' | 'admin' | 'manager';

/**
 * User interface representing the data contract between frontend and backend.
 */
export interface User {
    _id: string;             // Unique identifier from MongoDB
    id?: string;             // Alias used in some responses
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
 * Helper to set authentication cookies for Next.js middleware
 */
export const setAuthCookies = (token: string, role: string) => {
    if (typeof window === 'undefined') return;
    
    console.log("[AuthUtils] Setting cookies for middleware:", { role });
    
    // Set cookie for 7 days
    const expires = new Date();
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
    const expiresStr = expires.toUTCString();
    
    // Use a more robust cookie string
    // We specify the domain only if we are not on localhost to avoid issues
    const isLocalhost = window.location.hostname === "localhost";
    const cookieSuffix = `; expires=${expiresStr}; path=/; SameSite=Lax${isLocalhost ? "" : "; Secure"}`;
    
    try {
        document.cookie = `jwt=${token}${cookieSuffix}`;
        document.cookie = `user_role=${role}${cookieSuffix}`;
        console.log("[AuthUtils] Cookies set successfully");
    } catch (e) {
        console.error("[AuthUtils] Failed to set cookies:", e);
    }
};

/**
 * Helper to clear authentication cookies
 */
export const clearAuthCookies = () => {
    if (typeof window === 'undefined') return;
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure";
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure";
};

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
                // Store JWT token for API authorization
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    // Also set cookies for middleware
                    setAuthCookies(response.token, user.role);
                }
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
            // Store JWT token for API authorization
            if (typeof window !== 'undefined' && response.token) {
                localStorage.setItem('token', response.token);
                // Also set cookies for middleware
                setAuthCookies(response.token, user.role);
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
            clearAuthCookies(); // Clear cookies for middleware
        }
    }
};
