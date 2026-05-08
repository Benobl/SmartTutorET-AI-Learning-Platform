/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║           ADMIN DASHBOARD — CENTRALIZED MOCK DATA                     ║
 * ║                                                                        ║
 * ║   Single source of truth for all data displayed on admin pages.        ║
 * ║   Backend team: replace each export with a real API call.              ║
 * ║   Every section is marked with TODO comments for easy discovery.       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import {
    Server, Database, Cpu, Clock, Activity, Network,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// ─── KPI STAT CARDS ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/stats?timeframe=day|week|month|year
 * Top-level KPI cards shown in the admin overview, segmented by timeframe.
 */
export const adminStats = {
    // Current keyed stats
    day: {
        totalUsers: 12,
        totalStudents: 10,
        totalTutors: 2,
        platformRevenue: 450,
        pendingActions: 3,
        growth: "+2%"
    },
    week: {
        totalUsers: 85,
        totalStudents: 72,
        totalTutors: 13,
        platformRevenue: 3200,
        pendingActions: 8,
        growth: "+5%"
    },
    month: {
        totalUsers: 340,
        totalStudents: 310,
        totalTutors: 30,
        platformRevenue: 12400,
        pendingActions: 16,
        growth: "+12%"
    },
    year: {
        totalUsers: 2825,
        totalStudents: 2540,
        totalTutors: 195,
        platformRevenue: 64580,
        pendingActions: 45,
        growth: "+24%"
    },
    // Missing flat properties expected by page.tsx (using 'year' data by default)
    totalUsers: 2825,
    activeCourses: 124,
    platformRevenue: 64580,
    avgSessionTime: "42m",
    avgRating: 4.8,
    successRate: 98,
    supportTickets: 12
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── USER GROWTH CHART DATA ─────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/analytics/user-growth?range=year|month|week
 * Analytics data segmented by timeframe.
 */
export const analyticsData = {
    year: [
        { name: "Jan", students: 150, tutors: 12, revenue: 4250 },
        { name: "Feb", students: 280, tutors: 24, revenue: 6820 },
        { name: "Mar", students: 420, tutors: 35, revenue: 10250 },
        { name: "Apr", students: 580, tutors: 48, revenue: 14580 },
        { name: "May", students: 750, tutors: 62, revenue: 18750 },
        { name: "Jun", students: 920, tutors: 78, revenue: 23420 },
        { name: "Jul", students: 1120, tutors: 94, revenue: 28900 },
        { name: "Aug", students: 1350, tutors: 112, revenue: 34500 },
        { name: "Sep", students: 1620, tutors: 130, revenue: 41200 },
        { name: "Oct", students: 1920, tutors: 150, revenue: 48500 },
        { name: "Nov", students: 2250, tutors: 172, revenue: 56200 },
        { name: "Dec", students: 2540, tutors: 195, revenue: 64580 },
    ],
    month: [
        { name: "Week 1", students: 45, tutors: 4, revenue: 1200 },
        { name: "Week 2", students: 62, tutors: 6, revenue: 1800 },
        { name: "Week 3", students: 88, tutors: 8, revenue: 2400 },
        { name: "Week 4", students: 115, tutors: 12, revenue: 3500 },
    ],
    week: [
        { name: "Mon", students: 12, tutors: 1, revenue: 450 },
        { name: "Tue", students: 18, tutors: 2, revenue: 620 },
        { name: "Wed", students: 15, tutors: 1, revenue: 510 },
        { name: "Thu", students: 22, tutors: 3, revenue: 840 },
        { name: "Fri", students: 25, tutors: 4, revenue: 950 },
        { name: "Sat", students: 10, tutors: 1, revenue: 320 },
        { name: "Sun", students: 8, tutors: 0, revenue: 210 },
    ]
}

/**
 * Expected by page.tsx
 */
export const userGrowthData = analyticsData.year.map(item => ({
    month: item.name,
    students: item.students,
    tutors: item.tutors
}))

// ─────────────────────────────────────────────────────────────────────────────
// ─── USER DISTRIBUTION ──────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/analytics/user-distribution
 * User type breakdown for the pie/donut chart.
 */
export const userDistributionData = [
    { type: "Students", count: 2540, color: "#3B82F6", percentage: 89 },
    { type: "Tutors", count: 195, color: "#10B981", percentage: 7 },
    { type: "Instructors", count: 78, color: "#8B5CF6", percentage: 3 },
    { type: "Admins", count: 12, color: "#F59E0B", percentage: 1 },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── TUTOR APPLICATIONS ─────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/tutors/applications/summary
 * Tutor application pipeline status breakdown.
 */
export const tutorApplicationsData = [
    { status: "Pending Review", count: 8, color: "#F59E0B" },
    { status: "Approved", count: 45, color: "#10B981" },
    { status: "Interview", count: 5, color: "#3B82F6" },
    { status: "Rejected", count: 3, color: "#EF4444" },
    { status: "On Hold", count: 2, color: "#8B5CF6" },
]

/**
 * TODO: REPLACE WITH BACKEND API
 * Detailed user list for management tab.
 */
export const adminUserList = [
    { id: "USR-001", name: "Abebe Bikila", email: "abebe@example.com", role: "Student", status: "Active", joined: "2023-12-01", grade: "12" },
    { id: "USR-002", name: "Sara Hagos", email: "sara@example.com", role: "Student", status: "Active", joined: "2023-12-05", grade: "11" },
    { id: "USR-003", name: "Yonas Gebre", email: "yonas@example.com", role: "Tutor", status: "Active", joined: "2023-11-20", subject: "Mathematics" },
    { id: "USR-004", name: "Liya Tekle", email: "liya@example.com", role: "Instructor", status: "Suspended", joined: "2023-10-15", subject: "Physics" },
    { id: "USR-005", name: "Dawit Isaac", email: "dawit@example.com", role: "Student", status: "Active", joined: "2024-01-10", grade: "10" },
    { id: "USR-006", name: "Marta Wolde", email: "marta@example.com", role: "Student", status: "Inactive", joined: "2024-01-12", grade: "12" },
    { id: "USR-007", name: "Samuel Hailu", email: "samuel@example.com", role: "Tutor", status: "Active", joined: "2023-12-28", subject: "English" },
    { id: "USR-008", name: "Tigist Assefa", email: "tigist@example.com", role: "Student", status: "Active", joined: "2024-01-05", grade: "9" },
    { id: "USR-009", name: "Dr. Elias Zewde", email: "elias@example.com", role: "Manager", status: "Active", joined: "2023-09-12", subject: "Academic Registry" },
    { id: "USR-010", name: "Mulugeta Tesfaye", email: "mulu@example.com", role: "Manager", status: "Active", joined: "2023-08-20", subject: "Student Affairs" },
]

/**
 * TODO: REPLACE WITH BACKEND API
 * Detailed manager list for admin management.
 */
export const adminManagerList = [
    {
        id: "MGR-001",
        name: "Dr. Elias Zewde",
        email: "elias@example.com",
        department: "Academic Registry",
        status: "Active",
        joined: "2023-09-12",
        permissions: ["All"],
        managedTutors: 12,
    },
    {
        id: "MGR-002",
        name: "Mulugeta Tesfaye",
        email: "mulu@example.com",
        department: "Student Affairs",
        status: "Active",
        joined: "2023-08-20",
        permissions: ["Courses", "Students"],
        managedTutors: 8,
    },
    {
        id: "MGR-003",
        name: "Fatima Mohammed",
        email: "fatima@example.com",
        department: "Quality Assurance",
        status: "Inactive",
        joined: "2023-11-05",
        permissions: ["Reviews", "System"],
        managedTutors: 0,
    },
]

/**
 * TODO: REPLACE WITH BACKEND API
 * Detailed tutor list for vetting tab.
 */
export const adminTutorList = [
    {
        id: "TUT-001",
        name: "Dr. Alemayehu Tekle",
        email: "alemayehu@example.com",
        subjects: ["Mathematics", "Physics"],
        appliedDate: "2024-01-15",
        status: "pending",
        rating: 4.8,
        experience: "8 years",
        degree: "PhD",
        students: 0,
        priority: "high", // Added for compatibility
        country: "Ethiopia" // Added for compatibility
    },
    {
        id: "TUT-002",
        name: "Aster Gebre",
        email: "aster@example.com",
        subjects: ["Biology", "Chemistry"],
        appliedDate: "2024-01-18",
        status: "pending",
        rating: 4.9,
        experience: "6 years",
        degree: "MSc",
        students: 0,
        priority: "medium", // Added for compatibility
        country: "Ethiopia" // Added for compatibility
    },
    {
        id: "TUT-003",
        name: "Yonas Gebre",
        email: "yonas@example.com",
        subjects: ["Mathematics"],
        appliedDate: "2023-11-20",
        status: "approved",
        rating: 4.7,
        experience: "5 years",
        degree: "BSc",
        students: 45,
        priority: "low",
        country: "Ethiopia"
    },
    {
        id: "TUT-004",
        name: "Samuel Hailu",
        email: "samuel@example.com",
        subjects: ["English", "History"],
        appliedDate: "2023-12-28",
        status: "approved",
        rating: 4.5,
        experience: "4 years",
        degree: "MA",
        students: 32,
        priority: "low",
        country: "Ethiopia"
    },
]

/**
 * Expected by page.tsx
 */
export const pendingApplications = adminTutorList;

// ─────────────────────────────────────────────────────────────────────────────
// ─── CONTENT MODERATION ─────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/moderation/flags
 * Content flags and reports for moderation queue.
 */
export const contentFlags = [
    { id: 1, type: "Inappropriate Content", reported: 2, severity: "medium" as const, timestamp: "2h ago", status: "pending" as const, reporter: "Auto-Filter" },
    { id: 2, type: "Spam Messages", reported: 5, severity: "low" as const, timestamp: "4h ago", status: "resolved" as const, reporter: "User Report" },
    { id: 3, type: "Copyright Violation", reported: 1, severity: "high" as const, timestamp: "6h ago", status: "pending" as const, reporter: "DMCA System" },
    { id: 4, type: "Harassment Report", reported: 3, severity: "high" as const, timestamp: "1d ago", status: "investigating" as const, reporter: "User Report" },
    { id: 5, type: "Fake Profile", reported: 4, severity: "medium" as const, timestamp: "2d ago", status: "resolved" as const, reporter: "AI Detection" },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── SYSTEM HEALTH ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/system/health
 * Real-time system performance metrics.
 */
export const systemHealth = [
    { name: "Server Status", status: "healthy" as const, value: "99.8%", icon: Server, color: "#10B981" },
    { name: "Database", status: "healthy" as const, value: "100%", icon: Database, color: "#3B82F6" },
    { name: "API Response", status: "warning" as const, value: "120ms", icon: Cpu, color: "#F59E0B" },
    { name: "Uptime", status: "healthy" as const, value: "45 days", icon: Clock, color: "#8B5CF6" },
    { name: "Memory Usage", status: "healthy" as const, value: "68%", icon: Activity, color: "#6B7280" },
    { name: "Network", status: "healthy" as const, value: "1.2Gbps", icon: Network, color: "#78716C" },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── REVENUE DATA ───────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/analytics/revenue?range=year
 * Monthly revenue and platform fee data for line chart.
 */
export const revenueData = [
    { month: "Jan", revenue: 4250, platformFee: 425 },
    { month: "Feb", revenue: 6820, platformFee: 682 },
    { month: "Mar", revenue: 10250, platformFee: 1025 },
    { month: "Apr", revenue: 14580, platformFee: 1458 },
    { month: "May", revenue: 18750, platformFee: 1875 },
    { month: "Jun", revenue: 23420, platformFee: 2342 },
    { month: "Jul", revenue: 28900, platformFee: 2890 },
    { month: "Aug", revenue: 34500, platformFee: 3450 },
    { month: "Sep", revenue: 41200, platformFee: 4120 },
    { month: "Oct", revenue: 48500, platformFee: 4850 },
    { month: "Nov", revenue: 56200, platformFee: 5620 },
    { month: "Dec", revenue: 64580, platformFee: 6458 },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── RECENT ACTIVITY LOG ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/activity?limit=8
 * Recent admin activity feed.
 */
export const recentActivityLog = [
    { id: 1, action: "Tutor application approved", user: "Dr. Alemayehu Tekle", time: "15m ago", type: "approval" as const },
    { id: 2, action: "Content flag resolved", user: "System", time: "1h ago", type: "moderation" as const },
    { id: 3, action: "New course published", user: "Prof. Liya Tekle", time: "2h ago", type: "content" as const },
    { id: 4, action: "System backup completed", user: "Auto", time: "3h ago", type: "system" as const },
    { id: 5, action: "User report investigated", user: "Admin Team", time: "5h ago", type: "moderation" as const },
    { id: 6, action: "Database optimization", user: "Auto", time: "8h ago", type: "system" as const },
    { id: 7, action: "Revenue milestone: $60K", user: "System", time: "1d ago", type: "revenue" as const },
    { id: 8, action: "New student batch enrolled", user: "Registration", time: "1d ago", type: "user" as const },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── TAB NAVIGATION ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API / CMS
 * Admin dashboard tab navigation configuration.
 */
export const ADMIN_TABS = [
    { id: "overview", label: "Overview", icon: "📊", url: "/dashboard/admin" },
    { id: "tutors", label: "Tutors", icon: "🎓", url: "/dashboard/admin/tutors" },
    { id: "users", label: "All Users", icon: "👥", url: "/dashboard/admin/users" },
    { id: "managers", label: "Managers", icon: "💼", url: "/dashboard/admin/managers" },
    { id: "students", label: "Students", icon: "🧑‍🎓", url: "/dashboard/admin/students" },
    { id: "curriculum", label: "Curriculum", icon: "📚", url: "/dashboard/admin/curriculum" },
    { id: "revenue", label: "Revenue", icon: "💰", url: "/dashboard/admin/revenue" },
    { id: "settings", label: "Settings", icon: "🛠️", url: "/dashboard/admin/settings" },
]
