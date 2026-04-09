"use client"

import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Calendar, GraduationCap, ChevronRight, PlayCircle, Bell, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { courses, upcomingDeadlines, recentActivity, announcements } from "@/lib/student-data"
import Link from "next/link"

/**
 * Student Dashboard Overview — quick stats, active courses, upcoming deadlines,
 * recent announcements, and activity timeline.
 */
export default function StudentOverview() {
  const topCourses = courses.slice(0, 2)
  const topAnnouncements = announcements.filter((a) => !a.read).slice(0, 2)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Sarah!</span> 👋
        </h1>
        <p className="text-slate-500 flex items-center gap-2 font-medium">
          <GraduationCap className="w-4 h-4 text-sky-500" />
          You have 3 classes today. Keep up the great work!
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Progress", value: "78%", icon: BookOpen, color: "sky", sub: "12/15 Modules Complete" },
          { label: "Learning Hours", value: "42.5h", icon: Clock, color: "emerald", sub: "+5.2h this week" },
          { label: "Attendance", value: "96%", icon: Calendar, color: "indigo", sub: "12-day streak" },
          { label: "Current GPA", value: "3.8", icon: GraduationCap, color: "amber", sub: "Top 5% of class" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-100 transition-all group relative overflow-hidden">
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20",
              `bg-${stat.color}-500`
            )} />
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-2xl bg-slate-50 border border-slate-100", `text-${stat.color}-500`)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Courses + Deadlines */}
        <div className="xl:col-span-2 space-y-8">
          {/* Continue Learning */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
              </div>
              <Link href="/dashboard/student/courses" className="text-sky-600 text-sm font-bold hover:text-sky-500 transition-colors flex items-center gap-1 group">
                View All Courses
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topCourses.map((course) => (
                <div key={course.name} className="group rounded-3xl border border-slate-200 bg-white overflow-hidden hover:border-sky-300 transition-all duration-300 shadow-sm hover:shadow-md">
                  <div className="h-32 relative">
                    <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 shadow-sm">Active Course</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{course.name}</h4>
                      <p className="text-xs font-medium text-slate-500">{course.tutor}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Module Progress</span>
                        <span className="text-sky-600">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1.5 bg-slate-100" />
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Next Lesson</span>
                        <span className="text-xs font-bold text-slate-700">{course.nextLesson}</span>
                      </div>
                      <button className="p-2.5 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                        <PlayCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <h2 className="text-xl font-bold text-slate-900">Upcoming Deadlines</h2>
              </div>
              <Link href="/dashboard/student/assignments" className="text-sky-600 text-sm font-bold hover:text-sky-500 transition-colors flex items-center gap-1 group">
                All Assignments
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.map((d, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-sm group">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    d.color === "red" ? "bg-red-50 text-red-500" :
                      d.color === "amber" ? "bg-amber-50 text-amber-500" :
                        d.color === "sky" ? "bg-sky-50 text-sky-500" :
                          "bg-emerald-50 text-emerald-500"
                  )}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{d.title}</h4>
                    <p className="text-xs font-medium text-slate-400">{d.course}</p>
                  </div>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-lg shrink-0",
                    d.color === "red" ? "bg-red-50 text-red-600" :
                      d.color === "amber" ? "bg-amber-50 text-amber-600" :
                        "bg-slate-50 text-slate-500"
                  )}>
                    {d.dueLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Announcements & Activity */}
        <div className="space-y-8">
          {/* Announcements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-900">Announcements</h2>
              <Link href="/dashboard/student/announcements" className="text-sky-600 text-xs font-bold hover:text-sky-500 transition-colors flex items-center gap-1">
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {topAnnouncements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-indigo-50 to-sky-50 relative overflow-hidden group shadow-sm">
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-sky-400/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  {ann.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2 font-medium">{ann.body}</p>
                <Link href="/dashboard/student/announcements" className="w-full py-2.5 bg-white hover:bg-sky-500 hover:text-white text-sky-600 text-xs font-bold rounded-xl border border-sky-100 transition-all shadow-sm block text-center">
                  Read Announcement
                </Link>
              </div>
            ))}
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 px-2">Recent Activity</h2>
            <div className="relative pl-6 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
              {recentActivity.map((act, i) => (
                <div key={i} className="relative group">
                  <div className={cn(
                    "absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#f8f9fa] transition-all group-hover:scale-125",
                    act.color === "emerald" ? "bg-emerald-500" :
                      act.color === "sky" ? "bg-sky-500" :
                        act.color === "amber" ? "bg-amber-500" :
                          "bg-indigo-500"
                  )} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{act.title}</p>
                    <p className="text-xs font-medium text-slate-500">{act.sub}</p>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
