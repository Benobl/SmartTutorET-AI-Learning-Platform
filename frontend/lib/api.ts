const API_BASE_URL = "http://localhost:5000/api"

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
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

