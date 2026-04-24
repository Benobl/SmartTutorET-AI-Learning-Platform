"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SmartTutorBrand } from "@/components/brand-logo"
import { Users, FileText, Clock, DollarSign, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard/tutor" },
  { icon: Users, label: "My Students", href: "/dashboard/tutor/students" },
  { icon: Clock, label: "Schedule", href: "/dashboard/tutor/schedule" },
  { icon: DollarSign, label: "Earnings", href: "/dashboard/tutor/earnings" },
  { icon: FileText, label: "Materials", href: "/dashboard/tutor/materials" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/tutor/analytics" },
]

export function TutorSidebar() {
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
                      ? "bg-secondary/10 text-secondary font-medium"
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
          <Link href="/dashboard/tutor/settings">
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
