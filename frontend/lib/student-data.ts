/**
 * Centralized student data module
 * Single source of truth for all mock data used across student dashboard pages.
 * Replace with API calls in production.
 */

// ─── Student Profile ────────────────────────────────────────────────
export const studentProfile = {
    id: "STU-2024-001",
    firstName: "Sarah",
    lastName: "Jones",
    email: "sarah.jones@example.com",
    avatar: null, // null = show initials
    initials: "SJ",
    grade: "12",
    school: "Addis International School",
    bio: "Grade 12 student passionate about Mathematics and Physics. Aspiring Aerospace Engineer.",
    location: "Addis Ababa, Ethiopia",
    joinDate: "September 2023",
    gpa: 3.8,
    overallProgress: 78,
    attendanceRate: 96,
    totalHours: 42.5,
}

// ─── Courses ────────────────────────────────────────────────────────
export const courses = [
    {
        id: 1,
        name: "Mathematics - Calculus",
        code: "MATH-401",
        tutor: "Dr. Kebede Kassaye",
        progress: 65,
        lessons: 24,
        completed: 15,
        lastAccessed: "2 hours ago",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        tags: ["Math", "Grade 12"],
        nextLesson: "Differential Equations",
        schedule: "Mon, Wed, Fri — 9:00 AM",
    },
    {
        id: 2,
        name: "Physics - Mechanics",
        code: "PHYS-301",
        tutor: "Prof. Liya Tekle",
        progress: 32,
        lessons: 18,
        completed: 6,
        lastAccessed: "Yesterday",
        image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
        tags: ["Science", "Grade 11"],
        nextLesson: "Projectile Motion",
        schedule: "Tue, Thu — 10:30 AM",
    },
    {
        id: 3,
        name: "English Literature",
        code: "ENG-201",
        tutor: "Ms. Bethlehem Assefa",
        progress: 89,
        lessons: 12,
        completed: 11,
        lastAccessed: "3 days ago",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
        tags: ["English", "Grade 10"],
        nextLesson: "Poetry Analysis",
        schedule: "Mon, Wed — 2:00 PM",
    },
    {
        id: 4,
        name: "Chemistry - Organic",
        code: "CHEM-302",
        tutor: "Dr. Hana Mekonnen",
        progress: 55,
        lessons: 20,
        completed: 11,
        lastAccessed: "1 day ago",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
        tags: ["Science", "Grade 12"],
        nextLesson: "Hydrocarbons",
        schedule: "Tue, Thu — 1:00 PM",
    },
    {
        id: 5,
        name: "History - Modern Africa",
        code: "HIST-201",
        tutor: "Mr. Solomon Girma",
        progress: 72,
        lessons: 16,
        completed: 12,
        lastAccessed: "4 days ago",
        image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800&q=80",
        tags: ["Social Studies", "Grade 12"],
        nextLesson: "Post-Colonial Era",
        schedule: "Fri — 11:00 AM",
    },
]

// ─── Grades & Marks ─────────────────────────────────────────────────
export const grades = [
    {
        courseId: 1,
        courseName: "Mathematics - Calculus",
        code: "MATH-401",
        tutor: "Dr. Kebede Kassaye",
        letterGrade: "A-",
        percentage: 91,
        credits: 4,
        trend: "up" as const,
        gradeLevel: "12",
        semester: 1,
        assessments: [
            { name: "Assignment 1", score: 95, total: 100, weight: 10, date: "2025-09-20" },
            { name: "Assignment 2", score: 88, total: 100, weight: 10, date: "2025-10-15" },
            { name: "Midterm Exam", score: 89, total: 100, weight: 30, date: "2025-11-15" },
            { name: "Project", score: 92, total: 100, weight: 20, date: "2026-01-20" },
            { name: "Final Exam", score: 94, total: 100, weight: 30, date: "2026-01-30" },
        ],
    },
    {
        courseId: 2,
        courseName: "Physics - Mechanics",
        code: "PHYS-301",
        tutor: "Prof. Liya Tekle",
        letterGrade: "B+",
        percentage: 85,
        credits: 4,
        trend: "stable" as const,
        gradeLevel: "12",
        semester: 1,
        assessments: [
            { name: "Lab Report 1", score: 80, total: 100, weight: 15, date: "2025-09-30" },
            { name: "Midterm Exam", score: 82, total: 100, weight: 30, date: "2025-11-15" },
            { name: "Lab Report 2", score: 90, total: 100, weight: 15, date: "2025-12-05" },
            { name: "Final Exam", score: 88, total: 100, weight: 40, date: "2026-01-30" },
        ],
    },
    {
        courseId: 3,
        courseName: "English Literature",
        code: "ENG-201",
        tutor: "Ms. Bethlehem Assefa",
        letterGrade: "A",
        percentage: 94,
        credits: 3,
        trend: "up" as const,
        gradeLevel: "12",
        semester: 2,
        assessments: [
            { name: "Essay #1", score: 92, total: 100, weight: 20, date: "2026-02-20" },
            { name: "Midterm", score: 95, total: 100, weight: 25, date: "2026-03-18" },
            { name: "Presentation", score: 96, total: 100, weight: 15, date: "2026-04-10" },
            { name: "Final Exam", score: 94, total: 100, weight: 40, date: "2026-05-30" },
        ],
    },
    {
        courseId: 10,
        courseName: "Amharic Literature",
        code: "AMH-101",
        tutor: "Ato Abebe Bikila",
        letterGrade: "B+",
        percentage: 88,
        credits: 3,
        trend: "up" as const,
        gradeLevel: "9",
        semester: 1,
        assessments: [
            { name: "Assignment 1", score: 85, total: 100, weight: 20, date: "2022-09-20" },
            { name: "Midterm Exam", score: 88, total: 100, weight: 30, date: "2022-11-15" },
            { name: "Final Exam", score: 90, total: 100, weight: 50, date: "2023-01-30" },
        ],
    },
    {
        courseId: 11,
        courseName: "General Science",
        code: "SCI-101",
        tutor: "Ms. Tigist Wolde",
        letterGrade: "A-",
        percentage: 91,
        credits: 4,
        trend: "stable" as const,
        gradeLevel: "9",
        semester: 2,
        assessments: [
            { name: "Lab Report", score: 92, total: 100, weight: 20, date: "2023-03-20" },
            { name: "Midterm Exam", score: 89, total: 100, weight: 30, date: "2023-04-15" },
            { name: "Final Exam", score: 92, total: 100, weight: 50, date: "2023-06-10" },
        ],
    },
]

// ─── Attendance Records ─────────────────────────────────────────────
export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export interface AttendanceRecord {
    date: string
    status: AttendanceStatus
    course: string
    period: string
}

export const attendanceRecords: AttendanceRecord[] = [
    { date: "2026-03-03", status: "present", course: "Mathematics", period: "1st" },
    { date: "2026-03-03", status: "present", course: "Physics", period: "2nd" },
    { date: "2026-03-03", status: "present", course: "English", period: "4th" },
    { date: "2026-03-03", status: "present", course: "Chemistry", period: "5th" },
    { date: "2026-03-04", status: "present", course: "Mathematics", period: "1st" },
    { date: "2026-03-04", status: "late", course: "Physics", period: "2nd" },
    { date: "2026-03-04", status: "present", course: "History", period: "3rd" },
    { date: "2026-03-04", status: "present", course: "Chemistry", period: "5th" },
    { date: "2026-03-05", status: "present", course: "English", period: "1st" },
    { date: "2026-03-05", status: "present", course: "Mathematics", period: "2nd" },
    { date: "2026-03-05", status: "absent", course: "Chemistry", period: "4th" },
    { date: "2026-03-06", status: "present", course: "Physics", period: "1st" },
    { date: "2026-03-06", status: "present", course: "History", period: "3rd" },
    { date: "2026-03-06", status: "present", course: "English", period: "4th" },
    { date: "2026-03-07", status: "present", course: "Mathematics", period: "1st" },
    { date: "2026-03-07", status: "excused", course: "Physics", period: "2nd" },
    { date: "2026-03-07", status: "present", course: "History", period: "3rd" },
]

export const attendanceSummary = {
    totalClasses: 120,
    present: 110,
    absent: 4,
    late: 3,
    excused: 3,
    streak: 12,
    perCourse: [
        { course: "Mathematics", attended: 28, total: 30, rate: 93 },
        { course: "Physics", attended: 26, total: 28, rate: 93 },
        { course: "English Literature", attended: 24, total: 24, rate: 100 },
        { course: "Chemistry", attended: 20, total: 22, rate: 91 },
        { course: "History", attended: 12, total: 16, rate: 75 },
    ],
}

// ─── Weekly Timetable ───────────────────────────────────────────────
export interface TimetableSlot {
    id: string
    day: string
    startTime: string
    endTime: string
    course: string
    code: string
    tutor: string
    room: string
    color: string
}

export const timetable: TimetableSlot[] = [
    { id: "1", day: "Monday", startTime: "08:00", endTime: "09:30", course: "Mathematics", code: "MATH-401", tutor: "Dr. Kebede K.", room: "Room 201", color: "sky" },
    { id: "2", day: "Monday", startTime: "10:00", endTime: "11:30", course: "English Literature", code: "ENG-201", tutor: "Ms. Bethlehem A.", room: "Room 105", color: "emerald" },
    { id: "3", day: "Monday", startTime: "13:00", endTime: "14:30", course: "Chemistry", code: "CHEM-302", tutor: "Dr. Hana M.", room: "Lab 3", color: "violet" },
    { id: "4", day: "Tuesday", startTime: "08:00", endTime: "09:30", course: "Physics", code: "PHYS-301", tutor: "Prof. Liya T.", room: "Room 301", color: "amber" },
    { id: "5", day: "Tuesday", startTime: "10:00", endTime: "11:30", course: "History", code: "HIST-201", tutor: "Mr. Solomon G.", room: "Room 110", color: "rose" },
    { id: "6", day: "Tuesday", startTime: "13:00", endTime: "14:30", course: "Chemistry", code: "CHEM-302", tutor: "Dr. Hana M.", room: "Lab 3", color: "violet" },
    { id: "7", day: "Wednesday", startTime: "08:00", endTime: "09:30", course: "Mathematics", code: "MATH-401", tutor: "Dr. Kebede K.", room: "Room 201", color: "sky" },
    { id: "8", day: "Wednesday", startTime: "10:00", endTime: "11:30", course: "English Literature", code: "ENG-201", tutor: "Ms. Bethlehem A.", room: "Room 105", color: "emerald" },
    { id: "9", day: "Wednesday", startTime: "13:00", endTime: "14:30", course: "Physics", code: "PHYS-301", tutor: "Prof. Liya T.", room: "Room 301", color: "amber" },
    { id: "10", day: "Thursday", startTime: "08:00", endTime: "09:30", course: "Physics", code: "PHYS-301", tutor: "Prof. Liya T.", room: "Room 301", color: "amber" },
    { id: "11", day: "Thursday", startTime: "10:00", endTime: "11:30", course: "History", code: "HIST-201", tutor: "Mr. Solomon G.", room: "Room 110", color: "rose" },
    { id: "12", day: "Thursday", startTime: "13:00", endTime: "14:30", course: "Chemistry", code: "CHEM-302", tutor: "Dr. Hana M.", room: "Lab 3", color: "violet" },
    { id: "13", day: "Friday", startTime: "08:00", endTime: "09:30", course: "Mathematics", code: "MATH-401", tutor: "Dr. Kebede K.", room: "Room 201", color: "sky" },
    { id: "14", day: "Friday", startTime: "10:00", endTime: "11:30", course: "History", code: "HIST-201", tutor: "Mr. Solomon G.", room: "Room 110", color: "rose" },
    { id: "15", day: "Friday", startTime: "13:00", endTime: "14:30", course: "English Literature", code: "ENG-201", tutor: "Ms. Bethlehem A.", room: "Room 105", color: "emerald" },
    { id: "16", day: "Saturday", startTime: "09:00", endTime: "10:30", course: "Mathematics", code: "MATH-401", tutor: "Dr. Kebede K.", room: "Room 201", color: "sky" },
    { id: "17", day: "Saturday", startTime: "11:00", endTime: "12:30", course: "Physics", code: "PHYS-301", tutor: "Prof. Liya T.", room: "Room 301", color: "amber" },
]

// ─── Assignments ────────────────────────────────────────────────────
export const assignments = [
    { id: 1, title: "Calculus Homework #4", course: "Mathematics", courseCode: "MATH-401", due: "Tomorrow, 11:59 PM", status: "pending" as const, priority: "high" as const, description: "Solve problems 1-15 from Chapter 8: Integration techniques.", attachments: ["homework_4.pdf"] },
    { id: 2, title: "Mechanics Lab Report", course: "Physics", courseCode: "PHYS-301", due: "Friday, 5:00 PM", status: "pending" as const, priority: "medium" as const, description: "Write a lab report on the Newton's Second Law experiment.", attachments: ["lab_template.docx", "experiment_data.xlsx"] },
    { id: 3, title: "Short Story Analysis", course: "English", courseCode: "ENG-201", due: "Yesterday", status: "submitted" as const, priority: "low" as const, description: "Analyze the themes and literary devices in 'Things Fall Apart'.", attachments: ["analysis_rubric.pdf"], submittedDate: "2026-03-08" },
    { id: 4, title: "Algebra Quiz #2", course: "Mathematics", courseCode: "MATH-401", due: "Completed", status: "graded" as const, priority: "low" as const, grade: "95/100", description: "Online quiz covering chapters 5-7.", attachments: [], feedback: "Excellent work! Minor error on Q12." },
    { id: 5, title: "Organic Chemistry Worksheet", course: "Chemistry", courseCode: "CHEM-302", due: "Next Monday, 9:00 AM", status: "pending" as const, priority: "medium" as const, description: "Complete the worksheet on functional groups and naming conventions.", attachments: ["worksheet_3.pdf"] },
    { id: 6, title: "History Research Paper", course: "History", courseCode: "HIST-201", due: "In 2 weeks", status: "pending" as const, priority: "low" as const, description: "Research paper on post-independence economic policies in East Africa.", attachments: ["research_guidelines.pdf", "citation_format.pdf"] },
    { id: 7, title: "Physics Problem Set #3", course: "Physics", courseCode: "PHYS-301", due: "Completed", status: "graded" as const, priority: "low" as const, grade: "88/100", description: "Projectile motion and energy conservation problems.", attachments: [], feedback: "Good understanding of concepts. Review energy conservation in inelastic collisions." },
]

// ─── Announcements ──────────────────────────────────────────────────
export type AnnouncementCategory = "academic" | "administrative" | "urgent" | "general"

export interface Announcement {
    id: number
    title: string
    body: string
    category: AnnouncementCategory
    date: string
    author: string
    read: boolean
    pinned: boolean
}

export const announcements: Announcement[] = [
    { id: 1, title: "Upcoming Mock Exam Schedule", body: "The mid-term mathematics mock exam is scheduled for next Tuesday, March 15. Please review calculus modules 1-8 and bring scientific calculators. The exam will be held in Hall A from 9:00 AM to 12:00 PM.", category: "academic", date: "2026-03-09", author: "Dr. Kebede Kassaye", read: false, pinned: true },
    { id: 2, title: "School Holiday Notice", body: "Please note that the school will be closed on March 20th for a national holiday. All classes will resume on March 21st. Assignments due on the 20th have been extended to the 21st.", category: "administrative", date: "2026-03-08", author: "Administration", read: false, pinned: false },
    { id: 3, title: "Physics Lab Safety Update", body: "New safety protocols have been implemented in all science laboratories. All students must complete the online safety training module before their next lab session. Failure to complete this will result in restricted lab access.", category: "urgent", date: "2026-03-07", author: "Prof. Liya Tekle", read: true, pinned: false },
    { id: 4, title: "Library Hours Extended", body: "The school library will now be open until 8:00 PM on weekdays to support exam preparation. Weekend hours remain 9:00 AM - 5:00 PM. Study rooms can be booked through the student portal.", category: "general", date: "2026-03-06", author: "Library Services", read: true, pinned: false },
    { id: 5, title: "Science Fair Registration Open", body: "Registration for the annual Inter-School Science Fair is now open. Submit your project proposals by March 25th. Teams of 2-3 students are encouraged. See Mr. Solomon for mentorship sign-up.", category: "academic", date: "2026-03-05", author: "Science Department", read: true, pinned: false },
    { id: 6, title: "Student Council Elections", body: "Nominations for the Student Council elections are open until March 18th. Candidates must submit a written manifesto and obtain two teacher endorsements. Voting will take place on March 22nd.", category: "administrative", date: "2026-03-04", author: "Student Affairs", read: true, pinned: false },
    { id: 7, title: "Emergency Drill Tomorrow", body: "An emergency fire drill will be conducted tomorrow at 10:00 AM. All students and staff must follow the evacuation procedures as outlined in the safety manual. Assembly point: Main Football Field.", category: "urgent", date: "2026-03-03", author: "Safety Office", read: true, pinned: false },
]

// ─── Upcoming Deadlines (for overview page) ─────────────────────────
export const upcomingDeadlines = [
    { title: "Calculus Homework #4", course: "Mathematics", dueDate: "2026-03-10", dueLabel: "Tomorrow", color: "red" },
    { title: "Mechanics Lab Report", course: "Physics", dueDate: "2026-03-14", dueLabel: "Friday", color: "amber" },
    { title: "Organic Chemistry Worksheet", course: "Chemistry", dueDate: "2026-03-17", dueLabel: "Next Monday", color: "sky" },
    { title: "History Research Paper", course: "History", dueDate: "2026-03-23", dueLabel: "In 2 weeks", color: "emerald" },
]

// ─── Recent Activity ────────────────────────────────────────────────
export const recentActivity = [
    { title: "Assignment Submitted", sub: "Short Story Analysis — English", time: "2h ago", color: "emerald" },
    { title: "New Material Uploaded", sub: "Calculus Formula Sheet — Mathematics", time: "5h ago", color: "sky" },
    { title: "Grade Posted", sub: "Algebra Quiz #2 — 95/100", time: "1d ago", color: "amber" },
    { title: "Meeting with Tutor", sub: "Project Review — Dr. Kebede", time: "2d ago", color: "indigo" },
    { title: "Attendance Marked", sub: "All classes attended today", time: "3d ago", color: "emerald" },
]
