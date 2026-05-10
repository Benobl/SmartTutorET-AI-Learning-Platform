/**
 * Centralized dashboard data module
 * Single source of truth for all mock data used across student and tutor dashboard pages.
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
    // Grade 12 - Semester 1
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
    // Grade 12 - Semester 2
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
        courseId: 7,
        courseName: "Economics",
        code: "ECON-401",
        tutor: "Mr. Dawit Isaac",
        letterGrade: "A-",
        percentage: 92,
        credits: 3,
        trend: "up" as const,
        gradeLevel: "12",
        semester: 2,
        assessments: [
            { name: "Market Analysis", score: 94, total: 100, weight: 20, date: "2026-03-05" },
            { name: "Midterm Exam", score: 90, total: 100, weight: 30, date: "2026-04-15" },
            { name: "Final Paper", score: 93, total: 100, weight: 50, date: "2026-06-15" },
        ],
    },
    // Grade 11 - Semester 1
    {
        courseId: 4,
        courseName: "Biology - Genetics",
        code: "BIOL-301",
        tutor: "Ms. Tigist Wolde",
        letterGrade: "A-",
        percentage: 90,
        credits: 4,
        trend: "stable" as const,
        gradeLevel: "11",
        semester: 1,
        assessments: [
            { name: "Lab Report", score: 88, total: 100, weight: 20, date: "2024-09-30" },
            { name: "Midterm Exam", score: 91, total: 100, weight: 30, date: "2024-11-20" },
            { name: "Final Exam", score: 92, total: 100, weight: 50, date: "2025-01-25" },
        ],
    },
    // Grade 11 - Semester 2
    {
        courseId: 8,
        courseName: "World History",
        code: "HIST-302",
        tutor: "Mr. Solomon Girma",
        letterGrade: "B+",
        percentage: 87,
        credits: 3,
        trend: "down" as const,
        gradeLevel: "11",
        semester: 2,
        assessments: [
            { name: "Research Essay", score: 84, total: 100, weight: 30, date: "2025-03-10" },
            { name: "Midterm Exam", score: 86, total: 100, weight: 30, date: "2025-04-15" },
            { name: "Final Presentation", score: 91, total: 100, weight: 40, date: "2025-06-20" },
        ],
    },
    // Grade 10 - Semester 1
    {
        courseId: 5,
        courseName: "Chemistry - Inorganic",
        code: "CHEM-201",
        tutor: "Dr. Hana Mekonnen",
        letterGrade: "A",
        percentage: 93,
        credits: 4,
        trend: "up" as const,
        gradeLevel: "10",
        semester: 1,
        assessments: [
            { name: "Quiz 1", score: 95, total: 100, weight: 10, date: "2023-09-15" },
            { name: "Midterm Exam", score: 91, total: 100, weight: 40, date: "2023-11-10" },
            { name: "Final Exam", score: 94, total: 100, weight: 50, date: "2024-01-20" },
        ],
    },
    // Grade 10 - Semester 2
    {
        courseId: 9,
        courseName: "Geography",
        code: "GEOG-202",
        tutor: "Ms. Bethlehem Assefa",
        letterGrade: "A-",
        percentage: 89,
        credits: 3,
        trend: "stable" as const,
        gradeLevel: "10",
        semester: 2,
        assessments: [
            { name: "Map Project", score: 90, total: 100, weight: 30, date: "2024-03-12" },
            { name: "Midterm Exam", score: 88, total: 100, weight: 30, date: "2024-04-18" },
            { name: "Final Exam", score: 89, total: 100, weight: 40, date: "2024-06-12" },
        ],
    },
    // Grade 9 - Semester 1
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
    // Grade 9 - Semester 2
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
    subjectId?: string
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

// ─── Activity History ───────────────────────────────────────────────
export const recentActivity = [
    { title: "Calculus Quiz", sub: "Mastered 'Derivatives'", time: "2h ago", color: "emerald", category: "Quiz" },
    { title: "Study Group", sub: "Joined 'Physics Mech-1'", time: "4h ago", color: "sky", category: "Social" },
    { title: "Assignment Sub", sub: "English Essay #2", time: "Yesterday", color: "indigo", category: "Assignment" },
    { title: "Grade Posted", sub: "Biology Midterm: 92%", time: "2 days ago", color: "amber", category: "Result" },
    { title: "Course Enrolled", sub: "Economics 101", time: "3 days ago", color: "sky", category: "Course" },
    { title: "AI Tutor Session", sub: "Clarified Matrix algebra", time: "4 days ago", color: "purple", category: "AI" },
    { title: "New Material", sub: "Chemistry Lab Guide", time: "1 week ago", color: "emerald", category: "Resource" },
    { title: "System Update", sub: "V2.4 Dashboard Live", time: "Oct 12", color: "slate", category: "System" },
]

// ─── Class Squad (Communal Q&A) ───────────────────────────────────
export const squadPosts = [
    {
        id: 1,
        author: "Sarah J.",
        avatar: "/avatars/sarah.jpg",
        content: "Does anyone have the simplified formula for the multi-variable chain rule? The textbook explanation is a bit dense.",
        subject: "Mathematics",
        replies: 4,
        likes: 12,
        time: "45m ago",
        tags: ["Calculus", "ChainRule"],
        answers: [
            { author: "Dawit I.", avatar: "/avatars/dawit.jpg", content: "Check out page 142, there's a matrix representation that makes it way clearer!", time: "12m ago" }
        ]
    },
    {
        id: 2,
        author: "Abebe B.",
        avatar: "/avatars/abebe.jpg",
        content: "What's the main theme we should focus on for the 'Hamlet' essay? Is it madness or revenge?",
        subject: "English",
        replies: 2,
        likes: 5,
        time: "3h ago",
        tags: ["Literature", "Shakespeare"],
        answers: []
    }
]

// ─── Study Groups ──────────────────────────────────────────────────
export const studyGroups = [
    { id: 1, name: "Physics Mechanics Group", course: "Physics", students: 5, status: "Active", link: "meet.google.com/abc-defg-hij" },
    { id: 2, name: "Chemistry Lab Prep", course: "Chemistry", students: 3, status: "Pending", link: "meet.google.com/xyz-123-uvw" },
]

// ─── Friends ───────────────────────────────────────────────────────
export const friends = [
    { id: 1, name: "Dawit Isaac", online: true, courses: ["Math", "Physics"] },
    { id: 2, name: "Liya Tekle", online: true, courses: ["Math", "English"] },
    { id: 3, name: "Abebe Bikila", online: false, courses: ["History"] },
    { id: 4, name: "Bethlehem Assefa", online: true, courses: ["Biology"] },
]

// ─── Tutor Side Mock Data ───────────────────────────────────────────
// Following the same structure as requested

export const tutorProfile = {
    id: "TUT-2024-001",
    firstName: "Abebe",
    lastName: "Kebede",
    email: "abebe.kebede@example.com",
    avatar: "/avatars/teacher-1.png",
    initials: "AK",
    subject: "Physics",
    degree: "PhD in Physics",
    experience: "12 Years",
    bio: "Passionate Physics educator focused on making complex concepts simple for Grade 12 students.",
    location: "Addis Ababa, Ethiopia",
    joinDate: "August 2022",
    rating: 4.9,
    activeStudents: 156,
    totalCourses: 4,
    pendingHomework: 14,
    classAverage: 82,
    personal: {
        name: "Abebe Kebede",
    },
    courses: [
        {
            id: "c1",
            name: "Quantum Mechanics Intro",
            code: "PHYS-401",
            grade: "12",
            semester: "1",
            studentCount: 45,
            completionRate: 78,
            activeQuizzes: 2,
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
            nextClass: "Monday, 8:00 AM"
        },
        {
            id: "c2",
            name: "Kinematics & Dynamics",
            code: "PHYS-301",
            grade: "11",
            semester: "1",
            studentCount: 52,
            completionRate: 64,
            activeQuizzes: 1,
            image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
            nextClass: "Tuesday, 10:00 AM"
        },
        {
            id: "c3",
            name: "Thermodynamics",
            code: "PHYS-302",
            grade: "11",
            semester: "2",
            studentCount: 38,
            completionRate: 45,
            activeQuizzes: 3,
            image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
            nextClass: "Wednesday, 1:00 PM"
        },
    ]
}

export const tutorCourses = tutorProfile.courses;


export const tutorAssignments = [
    { id: 1, title: "Quantum Physics Midterm", course: "Quantum Mechanics Intro", courseCode: "PHYS-401", submitted: 42, graded: 28, maxScore: 100, due: "2026-03-20", totalStudents: 45, description: "Final assessment for the semester covering all quantum mechanics modules." },
    { id: 2, title: "Newton's Laws Worksheet", course: "Kinematics & Dynamics", courseCode: "PHYS-301", submitted: 50, graded: 50, maxScore: 50, due: "Completed", totalStudents: 52, description: "Basic dynamics problems involving force and acceleration." },
    { id: 3, title: "Heat Transfer Quiz", course: "Thermodynamics", courseCode: "PHYS-302", submitted: 12, graded: 0, maxScore: 20, due: "Tomorrow", totalStudents: 38, description: "Brief quiz on conduction, convection, and radiation." },
]

export const tutorSubmissions = [
    { id: 1, assignmentId: 1, studentName: "Yonas Alemu", status: "submitted", submittedAt: "2026-03-15", files: ["derivation_v1.pdf"] },
    { id: 2, assignmentId: 1, studentName: "Sarah Jones", status: "graded", submittedAt: "2026-03-14", files: ["sarah_physics.pdf"], score: 92, feedback: "Excellent derivation!" },
]

export const tutorAnnouncements = [
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

export const tutorActivity = [
    { title: "Grade Posted", sub: "Quantum Quiz #3", time: "1h ago", color: "emerald", category: "Result" },
    { title: "New Message", sub: "Sarah J. regarding integration", time: "3h ago", color: "sky", category: "Message" },
]

export const tutorSquads = [
    { id: "sq1", name: "Quantum Pioneers", subject: "Physics", studentCount: 8, active: true, activity: "High" },
    { id: "sq2", name: "Relativity Scholars", subject: "Physics", studentCount: 6, active: true, activity: "Medium" },
]

export const tutorStudents = [
    { id: "s1", name: "Biniyam Solomon", grade: "12", course: "Quantum Mechanics", attendance: "98%", average: 92, status: "excellent", trend: "up" },
    { id: "s2", name: "Helena Tesfaye", grade: "12", course: "Quantum Mechanics", attendance: "85%", average: 78, status: "good", trend: "up" },
    { id: "s3", name: "Dagmawi Girma", grade: "11", course: "Kinematics", attendance: "92%", average: 64, status: "struggling", trend: "down" },
    { id: "s4", name: "Selamawit Bekele", grade: "11", course: "Kinematics", attendance: "100%", average: 88, status: "excellent", trend: "up" },
    { id: "s5", name: "Yonas Alemu", grade: "12", course: "Quantum Mechanics", attendance: "76%", average: 45, status: "at-risk", trend: "down" },
]

export const tutorMessages = [
    {
        id: 1,
        studentName: "Biniyam Solomon",
        initials: "BS",
        course: "Quantum Mechanics",
        lastMessage: "Hello teacher, regarding the assignment...",
        time: "2h ago",
        unread: 1,
        messages: [
            { id: 1, from: "student", text: "Hello teacher, regarding the assignment on quantum entanglement, I'm stuck on the third derivation.", time: "2h ago" },
        ]
    },
    {
        id: 2,
        studentName: "Helena Tesfaye",
        initials: "HT",
        course: "Quantum Mechanics",
        lastMessage: "Thank you for the feedback!",
        time: "Yesterday",
        unread: 0,
        messages: [
            { id: 1, from: "teacher", text: "Great job on your midterm exam, Helena!", time: "Yesterday" },
            { id: 2, from: "student", text: "Thank you for the feedback!", time: "Yesterday" },
        ]
    }
]
