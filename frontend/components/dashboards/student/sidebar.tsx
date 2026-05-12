"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SmartTutorBrand } from "@/components/brand-logo"
import { BookOpen, BarChart3, Users, Zap, Award, Settings, LogOut, Menu, X, Bell, FileText, Calendar, LayoutDashboard, CalendarCheck, BrainCircuit } from "lucide-react"
import { useState } from "react"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/student" },
  { icon: BrainCircuit, label: "AI Lab", href: "/dashboard/student/ai-lab" },
  { icon: FileText, label: "My Grades", href: "/dashboard/student/grades" },
  { icon: CalendarCheck, label: "Attendance", href: "/dashboard/student/attendance" },
  { icon: Award, label: "Leaderboard", href: "/dashboard/student/leaderboard" },
  { icon: Bell, label: "Announcements", href: "/dashboard/student/announcements" },
  { icon: Calendar, label: "Timetable", href: "/dashboard/student/timetable" },
  { icon: BarChart3, label: "My Progress", href: "/dashboard/student/progress" },
  { icon: BookOpen, label: "Learning Hub", href: "/dashboard/student/resources" },
  { icon: Users, label: "Study Groups", href: "/dashboard/student/groups" },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg border border-border bg-card"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static w-64 h-screen bg-card border-r border-border flex flex-col transition-transform duration-300 z-40 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" onClick={() => setIsMobileOpen(false)}>
            <SmartTutorBrand />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border p-4 space-y-2">
          <Link href="/dashboard/student/settings">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}
