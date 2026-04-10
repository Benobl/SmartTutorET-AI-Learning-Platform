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
 * Refined Collapse toggle button.
 */
function CollapseToggle() {
    const { state, toggleSidebar } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <button
            onClick={toggleSidebar}
            className={cn(
                "flex items-center justify-center rounded-xl transition-all duration-300 group/toggle",
                "border border-slate-200 bg-white/50 backdrop-blur-md shadow-sm",
                "hover:bg-sky-50 hover:border-sky-200 hover:shadow-md",
                isCollapsed
                    ? "w-10 h-10 mx-auto"
                    : "w-full h-10 px-3 gap-3"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isCollapsed ? (
                <ChevronsRight className="w-5 h-5 text-slate-400 group-hover/toggle:text-sky-500 group-hover/toggle:translate-x-0.5 transition-all" />
            ) : (
                <>
                    <ChevronsLeft className="w-4 h-4 text-slate-400 group-hover/toggle:text-sky-500 group-hover/toggle:-translate-x-0.5 transition-all" />
                    <span className="text-xs font-semibold text-slate-500 group-hover/toggle:text-slate-900 flex-1 text-left transition-colors">Collapse</span>
                </>
            )}
        </button>
    )
}

export function DashboardSidebar() {
    const pathname = usePathname()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    const isTeacher = pathname.startsWith("/dashboard/teacher") || pathname.startsWith("/dashboard/tutor")
    const navigationItems = isTeacher ? teacherNavItems : studentNavItems
    const navLabel = isTeacher ? "Teacher Menu" : "Main Menu"

    const toggleExpanded = (title: string) => {
        setExpandedItem(prev => prev === title ? null : title)
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

            <SidebarHeader className="px-4 pt-6 pb-4 space-y-6 relative z-10">
                <Link href="/" className="flex items-center gap-3 group px-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/30 group-hover:scale-105 transition-all duration-500 shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                                SmartTutor<span className="text-sky-500">ET</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">LMS Platform</span>
                        </div>
                    )}
                </Link>
                <CollapseToggle />
            </SidebarHeader>

            <SidebarContent className="px-3 relative z-10 overflow-hidden">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="text-slate-400 uppercase tracking-[0.25em] text-[10px] font-bold px-4 mb-2 mt-2">
                        {navLabel}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {navigationItems.map((item) => {
                                const isActive = item.url === "/dashboard/student"
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
                                                    ? "bg-sky-50 text-sky-600 shadow-sm border border-sky-100"
                                                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"
                                            )}
                                            onClick={item.items ? () => toggleExpanded(item.title) : undefined}
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
