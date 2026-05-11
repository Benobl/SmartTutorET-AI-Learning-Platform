"use client"

import { useState } from "react"
import {
    LayoutDashboard,
    User,
    BookOpen,
    GraduationCap,
    CalendarCheck,
    CalendarDays,
    FileText,
    Bell,
    MessageSquare,
    Settings,
    HelpCircle,
    ChevronsLeft,
    ChevronsRight,
    LogOut,
    ChevronRight,
    Sparkles,
    Users,
    DollarSign,
    BarChart3,
    Shield,
    Activity,
    AlertCircle,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuBadge,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

interface NavItem {
    title: string
    url: string
    icon: any
    activeColor?: string
    badge?: number
    items?: { title: string; url: string }[]
}

/**
 * Navigation items for the student dashboard sidebar.
 */
const studentNavItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard/student",
        icon: LayoutDashboard,
        activeColor: "sky",
    },
    {
        title: "My Courses",
        url: "/dashboard/student/courses",
        icon: BookOpen,
        activeColor: "blue",
    },
    {
        title: "Grades & Marks",
        url: "/dashboard/student/grades",
        icon: GraduationCap,
        activeColor: "violet",
    },
    {
        title: "Attendance",
        url: "/dashboard/student/attendance",
        icon: CalendarCheck,
        activeColor: "emerald",
    },
    {
        title: "Timetable",
        url: "/dashboard/student/timetable",
        icon: CalendarDays,
        activeColor: "amber",
    },
    {
        title: "Assignments",
        url: "/dashboard/student/assignments",
        icon: FileText,
        badge: 2,
        activeColor: "rose",
    },
    {
        title: "Class Squad",
        url: "/dashboard/student/squad",
        icon: Users,
        activeColor: "sky",
        badge: 4,
    },
    {
        title: "Announcements",
        url: "/dashboard/student/announcements",
        icon: Bell,
        badge: 3,
        activeColor: "orange",
    },
    {
        title: "Quizzes",
        url: "/dashboard/student/quizzes",
        icon: GraduationCap,
        activeColor: "sky",
        badge: 2,
    },
]

/**
 * Navigation items for the teacher dashboard sidebar.
 */
const teacherNavItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard/tutor",
        icon: LayoutDashboard,
        activeColor: "sky",
    },
    {
        title: "My Courses",
        url: "/dashboard/tutor/courses",
        icon: BookOpen,
        activeColor: "sky",
    },
    {
        title: "My Students",
        url: "/dashboard/tutor/students",
        icon: Users,
        activeColor: "sky",
    },
    {
        title: "Assignments",
        url: "/dashboard/tutor/homework",
        icon: FileText,
        activeColor: "sky",
        badge: 2,
    },
    {
        title: "Academic Timetable",
        url: "/dashboard/tutor/timetable",
        icon: CalendarDays,
        activeColor: "sky",
    },
    {
        title: "Earnings",
        url: "/dashboard/tutor/earnings",
        icon: DollarSign,
        activeColor: "sky",
    },
    {
        title: "Class Squad",
        url: "/dashboard/tutor/squads",
        icon: Users,
        activeColor: "sky",
    },
    {
        title: "Quizzes",
        url: "/dashboard/tutor/quizzes",
        icon: GraduationCap,
        activeColor: "sky",
    },
]

/**
 * Navigation items for the manager dashboard sidebar.
 */
const managerNavItems: NavItem[] = [
    {
        title: "Overview",
        url: "/dashboard/manager",
        icon: LayoutDashboard,
        activeColor: "sky",
    },
    {
        title: "Academic Courses",
        url: "/dashboard/manager/courses",
        icon: BookOpen,
        activeColor: "sky",
        items: [
            { title: "Curriculum Registry", url: "/dashboard/manager/courses" },
            { title: "Master Timetable", url: "/dashboard/manager/schedule" },
            { title: "Subject Requests", url: "/dashboard/manager/approvals/subjects" }
        ]
    },
    {
        title: "Job Postings",
        url: "/dashboard/manager/jobs",
        icon: FileText,
        activeColor: "sky",
    },
    {
        title: "Tutor Approvals",
        url: "/dashboard/manager/tutors",
        icon: Users,
        activeColor: "sky",
        badge: 1,
    },
    {
        title: "Monitoring",
        url: "/dashboard/manager/monitoring",
        icon: Activity,
        activeColor: "sky",
    },
    {
        title: "Announcements",
        url: "/dashboard/manager/announcements",
        icon: Bell,
        activeColor: "sky",
    },
]

/**
 * Navigation items for the admin dashboard sidebar.
 */
const adminNavItems: NavItem[] = [
    {
        title: "Overview",
        url: "/dashboard/admin",
        icon: LayoutDashboard,
        activeColor: "sky",
    },
    {
        title: "Tutors",
        url: "/dashboard/admin/tutors",
        icon: GraduationCap,
        activeColor: "emerald",
        badge: 4,
    },
    {
        title: "Managers",
        url: "/dashboard/admin/managers",
        icon: Shield,
        activeColor: "indigo",
    },
    {
        title: "Students",
        url: "/dashboard/admin/students",
        icon: Users,
        activeColor: "blue",
    },
    {
        title: "All Users",
        url: "/dashboard/admin/users",
        icon: User,
        activeColor: "slate",
    },
    {
        title: "Revenue",
        url: "/dashboard/admin/revenue",
        icon: DollarSign,
        activeColor: "amber",
    },
    {
        title: "Settings",
        url: "/dashboard/admin/settings",
        icon: Settings,
        activeColor: "slate",
    },
];


/**
 * Refined Collapse toggle button - now integrated into the header.
 */
function CollapseToggle({ className }: { className?: string }) {
    const { state, toggleSidebar, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"

    if (isMobile) return null

    return (
        <button
            onClick={toggleSidebar}
            className={cn(
                "flex items-center justify-center rounded-lg transition-all duration-300 group/toggle",
                "border border-slate-200 bg-white shadow-sm hover:bg-sky-50 hover:border-sky-200 hover:shadow-md h-8 w-8 px-0",
                className
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isCollapsed ? (
                <ChevronsRight className="w-4 h-4 text-slate-400 group-hover/toggle:text-sky-500 transition-all" />
            ) : (
                <ChevronsLeft className="w-4 h-4 text-slate-400 group-hover/toggle:text-sky-500 transition-all" />
            )}
        </button>
    )
}

import { useEffect } from "react"
import { adminApi } from "@/lib/api"

export function DashboardSidebar() {
    const pathname = usePathname()
    const { state, setOpenMobile, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"
    const [expandedItem, setExpandedItem] = useState<string | null>(null)
    const [notifications, setNotifications] = useState({ tutors: 0 })

    const isTeacher = pathname.startsWith("/dashboard/teacher") || pathname.startsWith("/dashboard/tutor")
    const isManager = pathname.startsWith("/dashboard/manager")
    const isAdmin = pathname.startsWith("/dashboard/admin")
    
    useEffect(() => {
        if (isAdmin) {
            const fetchNotifications = async () => {
                try {
                    const res = await adminApi.getStats()
                    setNotifications({
                        tutors: res.data.pendingTutors || 0
                    })
                } catch (error) {
                    console.error("Failed to fetch sidebar notifications", error)
                }
            }
            fetchNotifications()
            // Optional: poll every minute
            const interval = setInterval(fetchNotifications, 60000)
            return () => clearInterval(interval)
        }
    }, [isAdmin])

    const navigationItems = isAdmin ? adminNavItems.map(item => {
        if (item.title === "Tutors") return { ...item, badge: notifications.tutors }
        return item
    }) : (isManager ? managerNavItems : (isTeacher ? teacherNavItems : studentNavItems))
    
    const navLabel = isAdmin ? "Admin Console" : (isManager ? "Registrar Console" : (isTeacher ? "Instructor Console" : "Student Hub"))

    const toggleExpanded = (title: string) => {
        setExpandedItem(prev => prev === title ? null : title)
    }

    const handleItemClick = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    return (
        <Sidebar
            variant="inset"
            collapsible="icon"
            className="bg-[#f8f9fa] border-r border-slate-200"
        >
            {/* ── Refined Backdrop ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute top-0 -left-1/4 w-full h-[300px] bg-sky-200/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 -right-1/4 w-full h-[300px] bg-indigo-200/20 blur-[100px] rounded-full" />
            </div>

            <SidebarHeader className="px-4 pt-6 pb-4 relative z-10">
                <div className="flex items-center justify-between w-full">
                    <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-105 transition-all duration-500 shrink-0 overflow-hidden">
                            <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-cover" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="font-black text-base leading-tight tracking-tight text-slate-900">
                                    SmartTutor<span className="text-sky-500">ET</span>
                                </span>
                                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Portal Area</span>
                            </div>
                        )}
                    </Link>
                    {!isCollapsed && <CollapseToggle />}
                </div>
                {isCollapsed && (
                    <div className="flex justify-center mt-2">
                        <CollapseToggle />
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="px-3 relative z-10 overflow-hidden">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="text-slate-400 uppercase tracking-[0.25em] text-[10px] font-bold px-4 mb-2 mt-2">
                        {navLabel}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {navigationItems.map((item) => {
                                const isExactMatch = pathname === item.url
                                const isRootDash = item.url === "/dashboard/student" || item.url === "/dashboard/tutor" || item.url === "/dashboard/admin" || item.url === "/dashboard/manager"
                                const isSubPathMatch = pathname.startsWith(item.url) && !isRootDash
                                const isActive = isExactMatch || isSubPathMatch
                                const isExpanded = expandedItem === item.title

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild={!item.items}
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={cn(
                                                "h-11 px-4 rounded-xl transition-all duration-200 relative group/item overflow-hidden",
                                                isActive
                                                    ? "bg-sky-50 text-sky-600 shadow-sm border border-sky-100"
                                                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"
                                            )}
                                            onClick={item.items ? () => toggleExpanded(item.title) : handleItemClick}
                                        >
                                            {item.items ? (
                                                <div className="flex items-center gap-3 w-full cursor-pointer">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                                        isActive ? "bg-white text-sky-500 shadow-sm" : "bg-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-slate-600 shadow-none border border-transparent group-hover/item:border-slate-200"
                                                    )}>
                                                        <item.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm flex-1">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <ChevronRight className={cn(
                                                        "w-4 h-4 text-slate-300 transition-transform duration-300",
                                                        isExpanded && "rotate-90"
                                                    )} />
                                                </div>
                                            ) : (
                                                <Link href={item.url} className="flex items-center gap-3 w-full">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                                        isActive ? "bg-white text-sky-500 shadow-sm" : "bg-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-slate-600 shadow-none border border-transparent group-hover/item:border-slate-200"
                                                    )}>
                                                        <item.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{item.title}</span>
                                                    {item.badge && (
                                                        <SidebarMenuBadge className="bg-sky-500 text-white text-[10px] font-bold border-0 px-2 h-5 rounded-full flex items-center justify-center shadow-sm">
                                                            {item.badge}
                                                        </SidebarMenuBadge>
                                                    )}
                                                </Link>
                                            )}
                                        </SidebarMenuButton>

                                        {/* Sub-items */}
                                        {item.items && isExpanded && !isCollapsed && (
                                            <div className="mt-1 flex flex-col gap-0.5 ml-8 border-l border-slate-200 pl-3">
                                                {item.items.map((subItem) => {
                                                    const isSubActive = pathname === subItem.url
                                                    return (
                                                        <Link
                                                            key={subItem.title}
                                                            href={subItem.url}
                                                            className={cn(
                                                                "h-8 flex items-center px-3 rounded-lg text-xs font-medium transition-all duration-200",
                                                                isSubActive
                                                                    ? "text-sky-600 bg-sky-50"
                                                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {subItem.title}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
