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
        title: "Live Classes",
        url: "/dashboard/tutor/live",
        icon: CalendarCheck,
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
    {
        title: "Analytics",
        url: "/dashboard/tutor/analytics",
        icon: BarChart3,
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
        title: "Tutor Approvals",
        url: "/dashboard/manager/tutors",
        icon: Users,
        activeColor: "sky",
        badge: 1, // Simulate pending tutor
    },
    {
        title: "Job Postings",
        url: "/dashboard/manager/jobs",
        icon: FileText,
        activeColor: "sky",
    },
    {
        title: "Course Catalog",
        url: "/dashboard/manager/courses",
        icon: BookOpen,
        activeColor: "sky",
    },
    {
        title: "Schedule Master",
        url: "/dashboard/manager/schedule",
        icon: CalendarDays,
        activeColor: "sky",
    },
    {
        title: "Analytics",
        url: "/dashboard/manager/analytics",
        icon: BarChart3,
        activeColor: "sky",
    },
]


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
                "border border-border bg-card shadow-sm hover:bg-accent hover:border-accent hover:shadow-md h-8 w-8 px-0",
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

export function DashboardSidebar() {
    const pathname = usePathname()
    const { state, setOpenMobile, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    const isTeacher = pathname.startsWith("/dashboard/teacher") || pathname.startsWith("/dashboard/tutor")
    const isManager = pathname.startsWith("/dashboard/manager")
    const navigationItems = isManager ? managerNavItems : (isTeacher ? teacherNavItems : studentNavItems)
    const navLabel = isManager ? "Registrar Console" : (isTeacher ? "Instructor Console" : "Student Hub")

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
            className="bg-background border-r border-border"
        >
            {/* ── Refined Backdrop ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute top-0 -left-1/4 w-full h-[300px] bg-sky-200/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 -right-1/4 w-full h-[300px] bg-indigo-200/20 blur-[100px] rounded-full" />
            </div>

            <SidebarHeader className="px-4 pt-6 pb-4 relative z-10">
                <div className="flex items-center justify-between w-full">
                    <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center shadow-lg border border-border group-hover:scale-105 transition-all duration-500 shrink-0 overflow-hidden">
                            <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-cover" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="font-black text-base leading-tight tracking-tight text-foreground">
                                    SmartTutor<span className="text-sky-500">ET</span>
                                </span>
                                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Portal Area</span>
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
                    <SidebarGroupLabel className="text-muted-foreground uppercase tracking-[0.25em] text-[10px] font-bold px-4 mb-2 mt-2">
                        {navLabel}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {navigationItems.map((item) => {
                                const isActive = (item.url === "/dashboard/student" || item.url === "/dashboard/tutor" || item.url === "/dashboard/manager")
                                    ? pathname === item.url
                                    : pathname === item.url || pathname.startsWith(item.url + "/")
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
                                                    ? "bg-sky-500/10 text-sky-500 shadow-sm border border-sky-500/20"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                                            )}
                                            onClick={item.items ? () => toggleExpanded(item.title) : handleItemClick}
                                        >
                                            {item.items ? (
                                                <div className="flex items-center gap-3 w-full cursor-pointer">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                                        isActive ? "bg-card text-sky-500 shadow-sm" : "bg-muted text-muted-foreground group-hover/item:bg-card group-hover/item:text-foreground shadow-none border border-transparent group-hover/item:border-border"
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
                                                        isActive ? "bg-card text-sky-500 shadow-sm" : "bg-muted text-muted-foreground group-hover/item:bg-card group-hover/item:text-foreground shadow-none border border-transparent group-hover/item:border-border"
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
                                            <div className="mt-1 flex flex-col gap-0.5 ml-8 border-l border-border pl-3">
                                                {item.items.map((subItem) => {
                                                    const isSubActive = pathname === subItem.url
                                                    return (
                                                        <Link
                                                            key={subItem.title}
                                                            href={subItem.url}
                                                            className={cn(
                                                                "h-8 flex items-center px-3 rounded-lg text-xs font-medium transition-all duration-200",
                                                                isActive
                                                                    ? "text-sky-500 bg-sky-500/10"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
