const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        "X-ST-CSRF": "XMLHttpRequest", // Custom header for CSRF protection
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    const fullUrl = `${cleanBaseUrl}/${cleanEndpoint}`;

    try {
        let response = await fetch(fullUrl, {
            ...options,
            headers,
            credentials: "include",
        });

        // Intercept 401 Unauthorized to refresh token
        if (response.status === 401 && endpoint !== "/auth/login" && endpoint !== "/auth/refresh") {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    console.log("[API] Token expired, attempting refresh...");
                    const refreshRes = await fetch(`${cleanBaseUrl}/auth/refresh`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-ST-CSRF": "XMLHttpRequest",
                        },
                        credentials: "include",
                    });

                    if (!refreshRes.ok) {
                        throw new Error("Session expired. Please log in again.");
                    }

                    const refreshData = await refreshRes.json();
                    const newToken = refreshData.token || refreshData.accessToken;
                    
                    if (newToken && typeof window !== "undefined") {
                        localStorage.setItem("token", newToken);
                        onRefreshed(newToken);
                    } else {
                        throw new Error("No token returned from refresh endpoint.");
                    }
                } catch (refreshErr) {
                    console.error("[API] Refresh failed:", refreshErr);
                    onRefreshed(""); // Unblock queue, but with failure
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/login";
                    }
                    throw refreshErr;
                } finally {
                    isRefreshing = false;
                }
            }

            // Wait for refresh to complete, then retry
            const newToken = await new Promise<string>((resolve) => {
                subscribeTokenRefresh((token) => resolve(token));
            });

            if (newToken) {
                // Retry original request with new token
                const retryHeaders = {
                    ...headers,
                    "Authorization": `Bearer ${newToken}`,
                };
                response = await fetch(fullUrl, {
                    ...options,
                    headers: retryHeaders,
                    credentials: "include",
                });
            } else {
                throw new Error("Session expired. Please log in again.");
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API Error Response] ${endpoint}:`, errorData);
            throw new Error(errorData.message || "Something went wrong");
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error(`[API FETCH ERROR] ${endpoint}:`, error.message || error);
        throw error;
    }
}

export const courseApi = {
    getAll: (params?: any) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return fetchWithAuth("/courses" + query);
    },
    getRecommendations: () => fetchWithAuth("/courses/recommendations"),
    getMyCourses: () => fetchWithAuth("/courses/my-courses"),
    getById: (courseId: string) => fetchWithAuth(`/courses/${courseId}`),
    enroll: (courseId: string) => fetchWithAuth(`/courses/${courseId}/enroll`, {
        method: "POST"
    }),
    create: (data: any) => fetchWithAuth("/courses", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => fetchWithAuth(`/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    }),
    delete: (id: string) => fetchWithAuth(`/courses/${id}`, {
        method: "DELETE"
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
    toggleLive: (groupId: string, data: { isLive: boolean, sessionData?: any }) =>
        fetchWithAuth(`/groups/${groupId}/toggle-live`, {
            method: "POST",
            body: JSON.stringify(data)
        }),
    getForums: (groupId: string) => fetchWithAuth(`/groups/${groupId}/forums`),
    getThreads: (forumId: string) => fetchWithAuth(`/groups/forums/${forumId}/threads`),
    createThread: (forumId: string, data: { title: string, content: string }) =>
        fetchWithAuth(`/groups/forums/${forumId}/threads`, {
            method: "POST",
            body: JSON.stringify(data)
        }),
    createPost: (threadId: string, content: string) =>
        fetchWithAuth(`/groups/threads/${threadId}/posts`, {
            method: "POST",
            body: JSON.stringify({ content })
        }),
    getPosts: (threadId: string) => fetchWithAuth(`/groups/threads/${threadId}/posts`),
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
    getBySquad: (squadId: string) => fetchWithAuth(`/questions/squad/${squadId}`),
    create: (data: any) => fetchWithAuth("/questions", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getAnswers: (questionId: string) => fetchWithAuth(`/questions/answers/${questionId}`),
    createAnswer: (data: any) => fetchWithAuth("/questions/answers", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    vote: (id: string, type: "upvote" | "downvote") => fetchWithAuth(`/questions/${type}/${id}`, {
        method: "POST"
    }),
};

export const aiApi = {
    getTutorResponse: (data: any) => fetchWithAuth("/ai/tutor-response", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getCourseOutline: (subject: string, grade: number) => fetchWithAuth("/ai/course-outline", {
        method: "POST",
        body: JSON.stringify({ subject, grade })
    }),
    getResourceSuggestions: (subject: string, grade: number) => fetchWithAuth("/ai/resource-suggestions", {
        method: "POST",
        body: JSON.stringify({ subject, grade })
    }),
    generateGradeCurriculum: (grade: string, stream: string) => fetchWithAuth("/ai/generate-grade-curriculum", {
        method: "POST",
        body: JSON.stringify({ grade, stream })
    }),
    generateGradeSchedule: (grade: string, stream: string, subjects: any[]) => fetchWithAuth("/ai/generate-grade-schedule", {
        method: "POST",
        body: JSON.stringify({ grade, stream, subjects })
    }),
    generateStudyPlan: (data: any) => fetchWithAuth("/ai/generate-study-plan", {
        method: "POST",
        body: JSON.stringify(data)
    })
};

export const userApi = {
    getAllStudents: () => fetchWithAuth("/users/students"),
    getAllTutors: () => fetchWithAuth("/users/tutors"),
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
    getStreamToken: () => fetchWithAuth("/auth/stream-token"),
};

export const chatApi = {
    getSquadHistory: (squadId: string) => fetchWithAuth(`/chat/squad/${squadId}`),
    getDirectHistory: (otherUserId: string) => fetchWithAuth(`/chat/direct/${otherUserId}`),
    markSeen: (messageIds: string[]) => fetchWithAuth("/chat/mark-seen", {
        method: "POST",
        body: JSON.stringify({ messageIds })
    }),
};

export const schedulingApi = {
    getAll: () => fetchWithAuth("/scheduling"),
    getMySchedule: () => fetchWithAuth("/scheduling/my-schedule"),
    getByGrade: (grade: string) => fetchWithAuth(`/scheduling/grade/${grade}`),
    create: (data: any) => fetchWithAuth("/scheduling", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    delete: (id: string) => fetchWithAuth(`/scheduling/${id}`, { method: "DELETE" }),
};

export const adminApi = {
    getPendingTutors: () => fetchWithAuth("/admin/pending-tutors"),
    approveTutor: (userId: string) => fetchWithAuth(`/admin/approve-tutor/${userId}`, {
        method: "PATCH"
    }),
    rejectTutor: (userId: string, reason?: string) => fetchWithAuth(`/admin/reject-tutor/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ reason })
    }),
    getStats: () => fetchWithAuth("/admin/stats"),
    getJobs: () => fetchWithAuth("/admin/jobs"),
    createJob: (data: any) => fetchWithAuth("/admin/jobs", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    deleteJob: (id: string) => fetchWithAuth(`/admin/jobs/${id}`, { method: "DELETE" }),
    // --- Subject Approval ---
    getPendingSubjects: () => fetchWithAuth("/admin/pending-subjects"),
    approveSubject: (id: string) => fetchWithAuth(`/admin/approve-subject/${id}`, {
        method: "PATCH"
    }),
    rejectSubject: (id: string) => fetchWithAuth(`/admin/reject-subject/${id}`, {
        method: "PATCH"
    }),
    // --- Monitoring ---
    getUsers: () => fetchWithAuth("/admin/users"),
    getStudentProgress: (studentId: string) => fetchWithAuth(`/admin/student-progress/${studentId}`),
};

export const notificationApi = {
    getMine: () => fetchWithAuth("/notifications/mine"),
    markAsRead: (id: string) => fetchWithAuth(`/notifications/mark-read/${id}`, { method: "PATCH" }),
    markAllAsRead: () => fetchWithAuth("/notifications/mark-all-read", { method: "PATCH" }),
};

export const uploadApi = {
    uploadDocument: async (file: File, type: "degree" | "cv"): Promise<{ url: string; filename: string }> => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const cleanBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://smarttutoret-ai-learning-platform.onrender.com/api").replace(/\/$/, "");

        const response = await fetch(`${cleanBaseUrl}/upload/document`, {
            method: "POST",
            headers: {
                "X-ST-CSRF": "XMLHttpRequest",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // NOTE: Do NOT set Content-Type — browser sets multipart/form-data with boundary automatically
            },
            credentials: "include",
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || "File upload failed");
        }

        const data = await response.json();
        return data.data; // { url, filename, originalName, size, type }
    },
};

export const assessmentApi = {
    getAll: (params?: any) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return fetchWithAuth("/assessments" + query);
    },
    getById: (id: string) => fetchWithAuth(`/assessments/${id}`),
    create: (data: any) => fetchWithAuth("/assessments", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    generateAI: (data: any) => fetchWithAuth("/assessments/generate-ai", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    submit: (id: string, data: any) => fetchWithAuth(`/assessments/${id}/submit`, {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getSubmissions: (assessmentId?: string) => {
        const query = assessmentId ? `?assessmentId=${assessmentId}` : "";
        return fetchWithAuth(`/assessments/submissions${query}`);
    },
};
