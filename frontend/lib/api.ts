const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smarttutoret-ai-learning-platform.onrender.com/api"

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
    getAll: () => fetchWithAuth("/courses"),
    getMyCourses: () => fetchWithAuth("/courses/my-courses"),
    getById: (courseId: string) => fetchWithAuth(`/courses/${courseId}`),
    enroll: (courseId: string, data: any = {}) => fetchWithAuth(`/courses/enroll/${courseId}`, {
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
