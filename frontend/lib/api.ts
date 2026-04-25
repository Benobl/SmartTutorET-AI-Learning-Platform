const API_BASE_URL = "http://localhost:5001/api"

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        "X-ST-CSRF": "XMLHttpRequest", // Custom header for CSRF protection
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Required for sending/receiving cookies
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Something went wrong");
    }

    return response.json();
}

export const courseApi = {
    getAll: () => fetchWithAuth("/course"),
    getMyCourses: () => fetchWithAuth("/course/my-courses"),
    getById: (courseId: string) => fetchWithAuth(`/course/${courseId}`),
    enroll: (courseId: string, data: any = {}) => fetchWithAuth(`/course/enroll/${courseId}`, {
        method: "POST",
        body: JSON.stringify(data)
    }),
};

export const groupApi = {
    getAll: () => fetchWithAuth("/groups"),
    getMyGroups: () => fetchWithAuth("/groups/mine"),
    create: (data: any) => fetchWithAuth("/groups", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    join: (groupId: string) => fetchWithAuth(`/groups/join/${groupId}`, { method: "POST" }),
};

export const inviteApi = {
    getMine: () => fetchWithAuth("/invites/mine"),
    send: (data: any) => fetchWithAuth("/invites", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    respond: (inviteId: string, status: string) => fetchWithAuth("/invites/respond", {
        method: "POST",
        body: JSON.stringify({ inviteId, status })
    }),
};

export const questionApi = {
    getAll: () => fetchWithAuth("/questions"),
    create: (data: any) => fetchWithAuth("/questions", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    createAnswer: (data: any) => fetchWithAuth("/questions/answers", {
        method: "POST",
        body: JSON.stringify(data)
    }),
};

export const userApi = {
    getAllStudents: () => fetchWithAuth("/users/students"),
    searchByEmail: (email: string) => fetchWithAuth(`/users/search?email=${email}`),
};

export const authApi = {
    signup: (data: any) => fetchWithAuth("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    login: (data: any) => fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    googleLogin: (credential: string) => fetchWithAuth("/auth/google-login", {
        method: "POST",
        body: JSON.stringify({ credential })
    }),
    forgotPassword: (email: string) => fetchWithAuth("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
    }),
    resetPassword: (token: string, data: any) => fetchWithAuth(`/auth/reset-password/${token}`, {
        method: "POST",
        body: JSON.stringify(data)
    }),
    logout: () => fetchWithAuth("/auth/logout", { method: "POST" }),
    getMe: () => fetchWithAuth("/auth/me"),
};
