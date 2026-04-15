// teacherData.ts

export interface TeacherAssignment {
    id: string;
    title: string;
    course: string;
    description: string;
    due: string;
    status: 'pending' | 'submitted' | 'graded';
    priority: 'high' | 'medium' | 'low';
}

export interface TeacherCourse {
    id: string;
    name: string;
    grade: string;
    semester: string;
    studentCount: number;
    completionRate: number;
    activeQuizzes: number;
}

export const mockTeacherData = {
    personal: {
        name: "Abebe Kebede",
        subject: "Physics",
        grades: ["Grade 11", "Grade 12"],
        avatar: "/avatars/teacher-1.png",
        status: "approved"
    },
    courses: [
        { id: "c1", name: "Quantum Mechanics Intro", grade: "12", semester: "1", studentCount: 45, completionRate: 78, activeQuizzes: 2 },
        { id: "c2", name: "Kinematics & Dynamics", grade: "11", semester: "1", studentCount: 52, completionRate: 64, activeQuizzes: 1 }
    ],
    schedule: [],
    squads: [],
    pendingHomework: 14,
    classAverage: 82
};

export const teacherAssignments = [
    { id: 1, title: "Quantum Physics Midterm", courseCode: "PHYS-12-A", submitted: 42, graded: 28, maxScore: 100 }
];

export const submissions = [
    { id: 1, assignmentId: 1, studentName: "Yonas Alemu", status: "submitted" }
];

export const teacherMessages = [
    {
        id: 1,
        studentName: "Biniyam Solomon",
        messages: []
    }
];
export const teacherAnnouncements = [
    {
        id: 1,
        title: "Welcome Back Students",
        body: "Please check your schedules for this semester.",
        category: "general",
        audienceLabel: "All Students",
        readCount: 120,
        totalCount: 150,
        sentAt: "2 hours ago",
        pinned: true
    },
    {
        id: 2,
        title: "Midterm Exam Schedule",
        body: "Midterm exams will start next Monday.",
        category: "academic",
        audienceLabel: "Grade 11 & 12",
        readCount: 98,
        totalCount: 150,
        sentAt: "1 day ago",
        pinned: false
    }
]
export const teacherCourses = mockTeacherData.courses;