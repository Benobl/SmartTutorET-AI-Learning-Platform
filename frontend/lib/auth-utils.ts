import mockData from './mock-data.json';
const mockUsers = mockData.users;

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
export const loginUser = (email: string, password: string): User | null => {
    // Check locally stored users first (newly registered)
    let extraUsers: User[] = [];
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('smarttutor_extra_users');
        if (stored) {
            try {
                extraUsers = JSON.parse(stored);
            } catch (e) {
                extraUsers = [];
            }
        }
    }

    const allUsers = [
        ...mockUsers.students,
        ...mockUsers.tutors,
        ...mockUsers.admins,
        ...mockUsers.managers,
        ...extraUsers
    ] as User[];

    // Find user with matching email and password
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        // Save to localStorage to simulate session
        if (typeof window !== 'undefined') {
            const { password, ...userWithoutPassword } = user;
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
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email || '',
        role: userData.role as UserRole || 'student',
        isVerified: false,
        ...userData
    } as User;

    if (typeof window !== 'undefined') {
        // Add to our "dynamic" mock database in localStorage
        const stored = localStorage.getItem('smarttutor_extra_users');
        const extraUsers = stored ? JSON.parse(stored) : [];
        extraUsers.push(newUser);
        localStorage.setItem('smarttutor_extra_users', JSON.stringify(extraUsers));

        // Also log them in immediately
        const { password, ...userWithoutPassword } = newUser;
        localStorage.setItem('smarttutor_user', JSON.stringify(userWithoutPassword));
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
