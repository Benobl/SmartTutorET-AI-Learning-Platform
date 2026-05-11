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

    const isFormData = options.body instanceof FormData;

    const headers: any = {
        "X-ST-CSRF": "XMLHttpRequest",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

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
            let errorData: any = {};
            const text = await response.text();
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                const rawText = text || "No response body";
                console.warn(`[API Raw Error] ${endpoint} (${response.status}):`, rawText);
                errorData = { message: rawText || `Server error (${response.status})` };
            }
            throw new Error(errorData.message || "Something went wrong");
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.warn(`[API FETCH ERROR] ${endpoint}:`, error.message || error);
        throw error;
    }
}

export const courseApi = {
    getAll: (params?: any) => {
        const query = params ? "?" + new URLSearchParams(params).toString() : "";
        return fetchWithAuth("/courses" + query);
    },
    getRecommendations: () => fetchWithAuth("/courses/recommendations"),
    getMyCourses: () => fetchWithAuth(`/courses/my-courses?t=${new Date().getTime()}`),
    getMyStudents: () => fetchWithAuth(`/courses/my-students?t=${new Date().getTime()}`),
    manualEnroll: (data: { subjectId: string; email: string }) => fetchWithAuth("/courses/manual-enroll", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    approve: (id: string) => fetchWithAuth(`/courses/${id}/approve`, { method: "PATCH" }),
    reject: (id: string) => fetchWithAuth(`/courses/${id}/reject`, { method: "PATCH" }),
    getById: (courseId: string) => fetchWithAuth(`/courses/${courseId}`),
    enroll: (courseId: string) => fetchWithAuth(`/courses/${courseId}/enroll`, {
        method: "POST"
    }),
    create: (data: any) => fetchWithAuth("/courses", {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    update: (id: string, data: any) => fetchWithAuth(`/courses/${id}`, {
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    delete: (id: string) => fetchWithAuth(`/courses/${id}`, {
        method: "DELETE"
    }),
    addLesson: (courseId: string, lessonData: any) => fetchWithAuth(`/courses/${courseId}/lessons`, {
        method: "POST",
        body: JSON.stringify(lessonData)
    }),
    autoGenerateLessons: (courseId: string) => fetchWithAuth(`/courses/${courseId}/lessons/auto-generate`, {
        method: "POST"
    }),
    uploadLessonVideo: async (courseId: string, formData: FormData) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const cleanBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");
        const response = await fetch(`${cleanBaseUrl}/courses/${courseId}/lessons/upload-video`, {
            method: "POST",
            headers: {
                "X-ST-CSRF": "XMLHttpRequest",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: formData,
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || "Video upload failed");
        }
        return response.json();
    },
    // Unified Content Management
    getContent: (courseId: string) => fetchWithAuth(`/courses/${courseId}/content`),
    addContent: (courseId: string, data: any) => fetchWithAuth(`/courses/${courseId}/content`, {
        method: "POST",
        body: JSON.stringify(data)
    }),
    deleteContent: (contentId: string) => fetchWithAuth(`/courses/content/${contentId}`, {
        method: "DELETE"
    }),
};

export const paymentApi = {
    initialize: (data: { amount: number, subjectId: string, method: string }) => 
        fetchWithAuth("/payments/initialize", {
            method: "POST",
            body: JSON.stringify(data)
        }),
    verify: (tx_ref: string) => fetchWithAuth(`/payments/verify/${tx_ref}`),
    getAudit: (subjectId: string) => fetchWithAuth(`/payments/subject/${subjectId}`),
    checkEnrollment: (subjectId: string) => fetchWithAuth(`/payments/check-enrollment/${subjectId}`),
    getTutorEarnings: () => fetchWithAuth("/payments/tutor/earnings"),
    getAdminEarnings: () => fetchWithAuth("/payments/admin/earnings"),
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
    getResourceSuggestions: (subject: string, grade: number, outline?: string) => fetchWithAuth("/ai/resource-suggestions", {
        method: "POST",
        body: JSON.stringify({ subject, grade, outline })
    }),
    askTutor: (studentQuery: string, performanceData: any) => fetchWithAuth("/ai/tutor-response", {
        method: "POST",
        body: JSON.stringify({ studentQuery, performanceData })
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

export const assignmentApi = {
    // Tutor
    create: (data: any) => fetchWithAuth("/assignments", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getSubmissions: (assignmentId: string) => fetchWithAuth(`/assignments/${assignmentId}/submissions`),
    evaluate: (submissionId: string, data: any) => fetchWithAuth(`/assignments/submission/${submissionId}/evaluate`, {
        method: "POST",
        body: JSON.stringify(data)
    }),
    
    // Student
    submit: (assignmentId: string, data: any) => fetchWithAuth(`/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getMyMarks: () => fetchWithAuth("/assignments/my-marks"),
    getMySubmissionsForCourse: (subjectId: string) => fetchWithAuth(`/assignments/course/${subjectId}/my-submissions`),
    getLeaderboard: (grade: string) => fetchWithAuth(`/assignments/leaderboard?grade=${grade}`),
    getMyGrades: () => fetchWithAuth("/assignments/my-grades"),
    
    // Common
    getByCourse: (subjectId: string) => fetchWithAuth(`/assignments/course/${subjectId}`),
};



export const userApi = {
    getAllStudents: () => fetchWithAuth("/users/students"),
    getAllTutors: () => fetchWithAuth("/users/tutors"),
    searchByEmail: (email: string) => fetchWithAuth(`/users/search?email=${email}`),
    getStats: () => fetchWithAuth("/users/stats"),
    getTutorStats: () => fetchWithAuth("/users/tutor-stats"),
    getLeaderboard: (grade?: string) => fetchWithAuth(`/users/leaderboard${grade ? `?grade=${grade}` : ""}`),
    updateProfile: (data: any) => fetchWithAuth("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(data)
    }),
    changePassword: (data: any) => fetchWithAuth("/users/change-password", {
        method: "PATCH",
        body: JSON.stringify(data)
    }),
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
    getConversations: () => fetchWithAuth("/chat/conversations"),
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
    getUsers: () => fetchWithAuth("/admin/users"),
    getStudentProgress: (studentId: string) => fetchWithAuth(`/admin/student-progress/${studentId}`),
    getPayments: () => fetchWithAuth("/admin/payments"),
    getLiveSessions: () => fetchWithAuth("/admin/live-sessions"),
    getAssessments: () => fetchWithAuth("/admin/assessments"),
    getForums: () => fetchWithAuth("/admin/forums"),
    deleteUser: (userId: string) => fetchWithAuth(`/admin/users/${userId}`, { method: "DELETE" }),
    appointManager: (email: string) => fetchWithAuth("/admin/appoint-manager", { method: "POST", body: JSON.stringify({ email }) }),
    updateUser: (userId: string, data: any) => fetchWithAuth(`/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(data) }),
    updateUserStatus: (userId: string, status: string) => fetchWithAuth(`/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    // --- Subject Approval ---
    getPendingSubjects: () => fetchWithAuth("/admin/pending-subjects"),
    approveSubject: (id: string) => fetchWithAuth(`/admin/approve-subject/${id}`, {
        method: "PATCH"
    }),
    rejectSubject: (id: string) => fetchWithAuth(`/admin/reject-subject/${id}`, {
        method: "PATCH"
    }),
    getAnalytics: (range?: string) => fetchWithAuth(`/admin/analytics${range ? `?range=${range}` : ""}`),
    getSettings: () => fetchWithAuth("/admin/settings"),
    updateSettings: (data: any) => fetchWithAuth("/admin/settings", { method: "PATCH", body: JSON.stringify(data) }),
    getHealth: () => fetchWithAuth("/admin/health"),
    getFlags: () => fetchWithAuth("/admin/flags"),
    resolveFlag: (id: string, note?: string) => fetchWithAuth(`/admin/flags/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ note })
    }),
};



export const notificationApi = {
    getMine: () => fetchWithAuth("/notifications/mine"),
    markAsRead: (id: string) => fetchWithAuth(`/notifications/mark-read/${id}`, { method: "PATCH" }),
    markAllAsRead: () => fetchWithAuth("/notifications/mark-all-read", { method: "PATCH" }),
    send: (data: { userIds: string[]; message: string; type?: string }) =>
        fetchWithAuth("/notifications/send", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

export const uploadApi = {
    uploadDocument: async (file: File, type: "degree" | "cv" | "assignment"): Promise<{ url: string; filename: string }> => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");

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
    start: (id: string) => fetchWithAuth(`/assessments/${id}/start`, {
        method: "POST"
    }),
    getSubmissions: (assessmentId?: string) => {
        const query = assessmentId ? `?assessment=${assessmentId}` : "";
        return fetchWithAuth(`/assessments/submissions${query}`);
    },
    delete: (id: string) => fetchWithAuth(`/assessments/${id}`, {
        method: "DELETE"
    }),
};

export const liveApi = {
    getActive: () => fetchWithAuth("/live/active"),
    getRecordings: () => fetchWithAuth("/live/recordings"),
    create: (data: any) => fetchWithAuth("/live", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    join: (sessionId: string) => fetchWithAuth(`/live/join/${sessionId}`, {
        method: "POST"
    }),
    end: (sessionId: string, recordingUrl?: string) => fetchWithAuth(`/live/end/${sessionId}`, {
        method: "POST",
        body: JSON.stringify({ recordingUrl })
    }),
    uploadRecording: async (blob: Blob) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const formData = new FormData();
        const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
        formData.append("video", blob, `recording-${Date.now()}.${extension}`);
        
        const cleanBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");
        const response = await fetch(`${cleanBaseUrl}/live/upload-recording`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        if (!response.ok) throw new Error("Recording upload failed");
    }
};

export const announcementApi = {
    getAll: (grade?: string) => fetchWithAuth(`/announcements${grade ? `?grade=${grade}` : ""}`),
    create: (data: any) => fetchWithAuth("/announcements", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    delete: (id: string) => fetchWithAuth(`/announcements/${id}`, {
        method: "DELETE"
    }),
};

export const attendanceApi = {
    log: (data: { subjectId: string; sessionId?: string; status?: string }) => fetchWithAuth("/attendance/log", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getMyAttendance: () => fetchWithAuth("/attendance/my"),
    getBySubject: (subjectId: string) => fetchWithAuth(`/attendance/subject/${subjectId}`),
};
