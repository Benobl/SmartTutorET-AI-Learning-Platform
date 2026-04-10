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

export const teacherAssignments = [
    { id: 1, title: "Quantum Physics Midterm", courseCode: "PHYS-12-A", submitted: 42, graded: 28, maxScore: 100 },
    { id: 2, title: "Kinematics Problem Set", courseCode: "PHYS-11-B", submitted: 35, graded: 35, maxScore: 50 },
    { id: 3, title: "Thermodynamics Quiz", courseCode: "PHYS-12-B", submitted: 38, graded: 12, maxScore: 25 }
];

export const submissions = [
    { id: 1, assignmentId: 1, studentName: "Yonas Alemu", submittedAt: "2024-03-20T10:30:00Z", status: "submitted", files: ["midterm_final.pdf", "derivations.jpg"] },
    { id: 2, assignmentId: 1, studentName: "Siham Mohammed", submittedAt: "2024-03-20T11:15:00Z", status: "submitted", files: ["physics_exam.pdf"] },
    { id: 3, assignmentId: 3, studentName: "Dawit Abraham", submittedAt: "2024-03-21T09:00:00Z", status: "submitted", files: ["thermo_quiz.pdf"] },
    { id: 4, assignmentId: 1, studentName: "Grace Kebede", submittedAt: "2024-03-19T14:20:00Z", status: "graded", files: ["midterm.pdf"] }
];

export const teacherMessages = [
    {
        id: 1,
        studentName: "Biniyam Solomon",
        initials: "BS",
        course: "Quantum Mechanics",
        lastMessage: "Thank you for the explanation, teacher!",
        time: "10 mins ago",
        unread: 0,
        messages: [
            { id: 1, from: "student", text: "Hello teacher, I have a question about the last lecture.", time: "2 hours ago" },
            { id: 2, from: "teacher", text: "Sure Biniyam, what is it?", time: "1 hour ago" },
            { id: 3, from: "student", text: "Can you re-explain the concept of entanglement?", time: "45 mins ago" },
            { id: 4, from: "teacher", text: "Entanglement occurs when particles become linked...", time: "30 mins ago" },
            { id: 5, from: "student", text: "Thank you for the explanation, teacher!", time: "10 mins ago" }
        ]
    },
    {
        id: 2,
        studentName: "Helena Tesfaye",
        initials: "HT",
        course: "Kinematics",
        lastMessage: "When is the next live session?",
        time: "1 hour ago",
        unread: 1,
        messages: [
            { id: 1, from: "student", text: "When is the next live session?", time: "1 hour ago" }
        ]
    }
];
