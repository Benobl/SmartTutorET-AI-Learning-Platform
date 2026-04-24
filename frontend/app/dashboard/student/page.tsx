"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen, Clock, Calendar, GraduationCap, ChevronRight,
  PlayCircle, Bell, FileText, AlertCircle, Sparkles,
  Zap, MessageSquare, Lightbulb, TrendingUp, Target, Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { courses, upcomingDeadlines, recentActivity, announcements } from "@/lib/mock-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// New Interactive Components
import { AITutorModal } from "@/components/dashboards/student/ai-tutor-modal"
import { CollaborationModals } from "@/components/dashboards/student/collaboration-modals"
import { ActivityHistoryModal } from "@/components/dashboards/student/activity-history-modal"

import { getCurrentUser } from "@/lib/auth-utils"

/**
 * Student Dashboard Overview — premium UI with quick stats, 
 * interactive learning paths, and personalized actions.
 */
export default function StudentOverview() {
  const [isAITutorOpen, setIsAITutorOpen] = useState(false)
  const [isStudyHubOpen, setIsStudyHubOpen] = useState(false)
  const [collabType, setCollabType] = useState<"create" | "invite">("create")
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false)

  const user = getCurrentUser()
  const studentName = user ? user.firstName : "Student"

  const topCourses = courses.slice(0, 2)
  const topAnnouncements = announcements.filter((a) => !a.read).slice(0, 2)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* Dynamic Greeting & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100/50">Student Portal</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Updates</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600">{studentName}!</span> 👋
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            You're on a <span className="text-slate-900 font-bold">12-day learning streak</span>. Ready for Calculus today?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setIsAITutorOpen(true)}
            variant="outline"
            className="h-12 px-5 rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm font-bold text-xs uppercase tracking-widest hover:bg-sky-50 hover:text-sky-600 transition-all shadow-sm group"
          >
            <MessageSquare className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Ask AI Tutor
          </Button>
          <Button
            onClick={() => { setCollabType("create"); setIsStudyHubOpen(true); }}
            className="h-12 px-6 rounded-2xl bg-sky-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-sky-700 transition-all shadow-xl shadow-sky-500/20 group"
          >
            <Zap className="w-4 h-4 mr-2 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
            Initialize Study Hub
          </Button>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Academic Mastery",
            value: "78%",
            icon: Target,
            color: "sky",
            sub: "12/15 Modules",
            trend: "+4% this week",
            bg: "from-sky-50 to-white"
          },
          {
            label: "Time Invested",
            value: "42.5h",
            icon: Clock,
            color: "indigo",
            sub: "Avg 2.4h / day",
            trend: "+5.2h session",
            bg: "from-indigo-50 to-white"
          },
          {
            label: "Attendance Rate",
            value: "96%",
            icon: Calendar,
            color: "emerald",
            sub: "Perfect in Math",
            trend: "Top 1% Rank",
            bg: "from-emerald-50 to-white"
          },
          {
            label: "Current GPA",
            value: "3.8",
            icon: TrendingUp,
            color: "purple",
            sub: "Dean's List",
            trend: "Honors Track",
            bg: "from-purple-50 to-white"
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              "group relative p-6 rounded-[32px] bg-gradient-to-br border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-sky-200 transition-all duration-500 overflow-hidden",
              stat.bg
            )}
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={cn(
                  "p-3.5 rounded-2xl border transition-all duration-500 group-hover:rotate-6 shadow-sm bg-white",
                  `text-${stat.color}-500 border-${stat.color}-100 group-hover:bg-${stat.color}-500 group-hover:text-white`
                )}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={cn("px-2.5 py-1 rounded-lg bg-white/80 border text-[9px] font-black uppercase tracking-tighter", `text-${stat.color}-600 border-${stat.color}-100`)}>
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className={cn(
              "absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-5 blur-3xl transition-all duration-700 group-hover:opacity-20 group-hover:scale-150",
              `bg-${stat.color}-500`
            )} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-10">

          {/* Active Learning Path */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-sky-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Learning Journey</h2>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-5">Resume where you left off</p>
              </div>
              <Link href="/dashboard/student/courses" className="h-10 px-4 rounded-xl text-sky-600 text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-all flex items-center gap-2 group">
                Full Catalog
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topCourses.map((course) => (
                <div key={course.name} className="group rounded-[36px] border border-slate-100 bg-white overflow-hidden hover:border-sky-300 transition-all duration-700 shadow-sm hover:shadow-2xl">
                  <div className="h-36 relative overflow-hidden">
                    <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-sky-100 shadow-sm">
                        Calculus Mastery
                      </span>
                    </div>
                  </div>
                  <div className="p-7 space-y-5">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">{course.name}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{course.tutor}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</span>
                        <span className="text-xs font-black text-sky-600">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Up Next</span>
                        <span className="text-xs font-bold text-slate-700">{course.nextLesson}</span>
                      </div>
                      <button className="p-3.5 rounded-2xl bg-slate-900 text-white hover:bg-sky-500 transition-all shadow-lg group/btn">
                        <PlayCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Highlights */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500 uppercase">Communal Hub</h2>
              </div>
              <Link href="/dashboard/student/squad" className="h-10 px-4 rounded-xl text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 group">
                Squad Feed
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div className="p-8 rounded-[40px] bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-500 group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Invite Friends</h4>
                <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">Assemble your squad and start collaborating on assignments.</p>
                <Button
                  onClick={() => { setCollabType("invite"); setIsStudyHubOpen(true); }}
                  variant="secondary"
                  className="w-full h-12 rounded-xl bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  Search Collaborators
                </Button>
              </div>
              <div className="p-8 rounded-[40px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-sky-400 fill-sky-400" />
                  </div>
                  <h4 className="text-xl font-black mb-2">Start Video Call</h4>
                  <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">Launch a direct P2P video session with high fidelity.</p>
                  <Button
                    onClick={() => { setCollabType("create"); setIsStudyHubOpen(true); }}
                    className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-600/30"
                  >
                    Launch Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Deadlines */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-rose-500 rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 uppercase">Deliverables</h2>
              </div>
              <Link href="/dashboard/student/assignments" className="h-10 px-4 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                Assignments <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {upcomingDeadlines.map((d, i) => (
                <div key={i} className="flex items-center gap-5 p-5 rounded-[28px] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110",
                    d.color === "red" ? "bg-red-50 text-red-500 border-red-100" :
                      d.color === "amber" ? "bg-amber-50 text-amber-500 border-amber-100" :
                        d.color === "sky" ? "bg-sky-50 text-sky-500 border-sky-100" :
                          "bg-emerald-50 text-emerald-500 border-emerald-100"
                  )}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-slate-900 truncate uppercase tracking-tight">{d.title}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{d.course}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border shadow-sm",
                      d.color === "red" ? "bg-red-50 text-red-600 border-red-200 animate-pulse" :
                        d.color === "amber" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                      {d.dueLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Improved Sidebar */}
        <div className="space-y-10">

          {/* Notifications / Announcements */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Bulletin</h2>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">{topAnnouncements.length} NEW</span>
            </div>
            <div className="space-y-4">
              {topAnnouncements.map((ann) => (
                <div key={ann.id} className="group relative p-8 rounded-[40px] border border-indigo-100 bg-indigo-50/30 hover:bg-white hover:shadow-2xl hover:border-sky-200 transition-all duration-500 overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-400/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{ann.author}</span>
                  </div>
                  <h4 className="font-black text-slate-900 mb-2 leading-tight group-hover:text-sky-600 transition-colors uppercase tracking-tight">
                    {ann.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium mb-6 italic">
                    {ann.body}
                  </p>
                  <Button variant="outline" className="w-full h-11 rounded-xl bg-white border-indigo-100 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                    Expand Details
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight px-2 uppercase">Pulse Feed</h2>
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {recentActivity.slice(0, 4).map((act, i) => (
                <div key={i} className="relative group">
                  <div className={cn(
                    "absolute -left-[31px] top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all group-hover:scale-125 shadow-sm group-hover:shadow-lg z-10",
                    act.color === "emerald" ? "bg-emerald-500" :
                      act.color === "sky" ? "bg-sky-500" :
                        act.color === "amber" ? "bg-amber-500" :
                          "bg-indigo-500"
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-800 group-hover:text-sky-600 transition-colors leading-none tracking-tight">{act.title}</p>
                    <p className="text-xs font-bold text-slate-400 italic">{act.sub}</p>
                    <span className="inline-block text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 mt-1">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setIsActivityHistoryOpen(true)}
              variant="ghost"
              className="w-full h-12 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50 gap-2 mt-4"
            >
              Full Activity History <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <AITutorModal isOpen={isAITutorOpen} onOpenChange={setIsAITutorOpen} />
      <CollaborationModals isOpen={isStudyHubOpen} onOpenChange={setIsStudyHubOpen} type={collabType} />
      <ActivityHistoryModal isOpen={isActivityHistoryOpen} onOpenChange={setIsActivityHistoryOpen} />
    </div>
  )
}
