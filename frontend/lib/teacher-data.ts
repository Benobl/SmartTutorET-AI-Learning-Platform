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
    schedule: [
        { time: "09:00", activity: "Live Session: Grade 12 Physics", course: "Quantum Mechanics Intro", type: "live" },
        { time: "11:00", activity: "Office Hours", course: "General", type: "office" },
        { time: "14:00", activity: "Squad Meeting: Science Innovators", course: "Kinematics", type: "squad" }
    ],
    squads: [
        { id: "s1", name: "Science Innovators", studentCount: 12, activity: "Active Now" },
        { id: "s2", name: "Math Wizards", studentCount: 8, activity: "Last active 2h ago" }
    ],
    pendingHomework: 14,
    classAverage: 82
};
