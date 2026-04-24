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
 * Endpoint: GET /api/admin/stats
 * Top-level KPI cards shown in the admin overview.
 */
export const adminStats = {
    totalUsers: 2825,
    totalStudents: 2540,
    totalTutors: 195,
    totalInstructors: 78,
    totalAdmins: 12,
    activeCourses: 84,
    platformRevenue: 64580,
    pendingActions: 16,
    highPriorityActions: 3,
    avgSessionTime: "45 min",
    avgRating: 4.8,
    successRate: 94,
    supportTickets: 18,
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── USER GROWTH CHART DATA ─────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/admin/analytics/user-growth?range=year
 * Monthly user growth data for area chart.
 */
export const userGrowthData = [
    { month: "Jan", students: 150, tutors: 12, instructors: 5, revenue: 4250 },
    { month: "Feb", students: 280, tutors: 24, instructors: 8, revenue: 6820 },
    { month: "Mar", students: 420, tutors: 35, instructors: 12, revenue: 10250 },
    { month: "Apr", students: 580, tutors: 48, instructors: 18, revenue: 14580 },
    { month: "May", students: 750, tutors: 62, instructors: 25, revenue: 18750 },
    { month: "Jun", students: 920, tutors: 78, instructors: 32, revenue: 23420 },
    { month: "Jul", students: 1120, tutors: 94, instructors: 40, revenue: 28900 },
    { month: "Aug", students: 1350, tutors: 112, instructors: 48, revenue: 34500 },
    { month: "Sep", students: 1620, tutors: 130, instructors: 55, revenue: 41200 },
    { month: "Oct", students: 1920, tutors: 150, instructors: 62, revenue: 48500 },
    { month: "Nov", students: 2250, tutors: 172, instructors: 70, revenue: 56200 },
    { month: "Dec", students: 2540, tutors: 195, instructors: 78, revenue: 64580 },
]

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
 * Endpoint: GET /api/admin/tutors/applications?status=pending
 * Pending tutor applications requiring admin review.
 */
export const pendingApplications = [
    {
        id: 1,
        name: "Dr. Alemayehu Tekle",
        email: "alemayehu@example.com",
        subjects: ["Mathematics", "Physics"],
        appliedDate: "2024-01-15",
        status: "pending" as const,
        rating: 4.8,
        experience: "8 years",
        country: "Ethiopia",
        priority: "high" as const,
        degree: "PhD in Applied Mathematics",
        documents: ["degree_cert.pdf", "teaching_license.pdf"],
    },
    {
        id: 2,
        name: "Aster Gebre",
        email: "aster@example.com",
        subjects: ["Biology", "Chemistry"],
        appliedDate: "2024-01-18",
        status: "pending" as const,
        rating: 4.9,
        experience: "6 years",
        country: "Ethiopia",
        priority: "medium" as const,
        degree: "MSc in Biochemistry",
        documents: ["msc_degree.pdf"],
    },
    {
        id: 3,
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        subjects: ["English Literature"],
        appliedDate: "2024-01-20",
        status: "pending" as const,
        rating: 4.6,
        experience: "10 years",
        country: "USA",
        priority: "low" as const,
        degree: "MA in English Literature",
        documents: ["ma_degree.pdf", "tefl_cert.pdf"],
    },
    {
        id: 4,
        name: "Michael Chen",
        email: "m.chen@example.com",
        subjects: ["Computer Science", "Mathematics"],
        appliedDate: "2024-01-22",
        status: "pending" as const,
        rating: 4.7,
        experience: "5 years",
        country: "Canada",
        priority: "high" as const,
        degree: "MSc in Computer Science",
        documents: ["msc_degree.pdf"],
    },
]

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
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "tutors", label: "Tutors", icon: "🎓" },
    { id: "moderation", label: "Moderation", icon: "🛡️" },
    { id: "revenue", label: "Revenue", icon: "💰" },
    { id: "system", label: "System", icon: "⚙️" },
]
