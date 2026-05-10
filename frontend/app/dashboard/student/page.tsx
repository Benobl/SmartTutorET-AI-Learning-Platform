"use client"

import { useState, useEffect, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen, Clock, Calendar, GraduationCap, ChevronRight,
  PlayCircle, Bell, FileText, AlertCircle, Sparkles,
  Zap, MessageSquare, Lightbulb, TrendingUp, Target, Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { announcements, upcomingDeadlines, recentActivity } from "@/lib/mock-data"
import { userApi, courseApi, assignmentApi, assessmentApi } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// New Interactive Components
import { AITutorModal } from "@/components/dashboards/student/ai-tutor-modal"
import { CollaborationModals } from "@/components/dashboards/student/collaboration-modals"
import { ActivityHistoryModal } from "@/components/dashboards/student/activity-history-modal"
import { AssessmentList } from "@/components/dashboards/student/assessment-list"

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
  const [stats, setStats] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [assignmentResults, setAssignmentResults] = useState<any[]>([])
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const user = getCurrentUser()
  const studentName = user?.name?.split(" ")[0] || "Student"

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [statsRes, coursesRes, marksRes, quizRes] = await Promise.allSettled([
        userApi.getStats(),
        courseApi.getMyCourses(),
        assignmentApi.getMyMarks(),
        assessmentApi.getSubmissions(),
      ])
      if (statsRes.status === "fulfilled") setStats(statsRes.value?.data || null)
      if (coursesRes.status === "fulfilled") setEnrolledCourses(coursesRes.value?.data || [])
      if (marksRes.status === "fulfilled") setAssignmentResults(marksRes.value?.data || [])
      if (quizRes.status === "fulfilled") setQuizResults((quizRes.value?.data || []).filter((row: any) => row?.gradedAt))
    } catch (error) {
      console.error("Failed to fetch student data", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const topCourses = enrolledCourses.slice(0, 6)
  const topAnnouncements = announcements.filter((a) => !a.read).slice(0, 2)
  const latestResults = [
    ...(assignmentResults || []).map((result: any) => ({
      id: `as-${result._id}`,
      title: result?.assignment?.title,
      subject: result?.assignment?.subject?.title || "Subject",
      score: `${result?.marksObtained}/${result?.assignment?.maxMarks}`,
      rank: result?.result?.rank && result?.result?.totalEvaluated
        ? `Rank #${result.result.rank}/${result.result.totalEvaluated}`
        : "Graded",
      updatedAt: result?.updatedAt,
      type: "Assignment",
    })),
    ...(quizResults || []).map((result: any) => ({
      id: `qz-${result._id}`,
      title: result?.assessment?.title,
      subject: result?.assessment?.type || "Quiz",
      score: `${result?.percentage}%`,
      rank: result?.result?.rank && result?.result?.totalEvaluated
        ? `Rank #${result.result.rank}/${result.result.totalEvaluated}`
        : "Graded",
      updatedAt: result?.updatedAt || result?.submittedAt,
      type: "Quiz",
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 3)

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
            label: "Assessment Score",
            value: stats ? `${stats.gpa * 20}%` : "...", // Mocking conversion
            icon: Target,
            color: "sky",
            sub: stats ? `Overall Rank: ${stats.rank}` : "Loading...",
            trend: "+2% Today",
            bg: "from-sky-50 to-white"
          },
          {
            label: "Quizzes Taken",
            value: stats ? String(stats.quizzesTaken) : "...",
            icon: GraduationCap,
            color: "indigo",
            sub: "Last: Photosynthesis",
            trend: "Active Student",
            bg: "from-indigo-50 to-white"
          },
          {
            label: "Learning Streak",
            value: stats ? String(stats.streak) : "...",
            icon: Zap,
            color: "amber",
            sub: "Days active",
            trend: "Master Level",
            bg: "from-amber-50 to-white"
          },
          {
            label: "Current GPA",
            value: stats ? String(stats.gpa) : "...",
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
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-2xl border bg-white shadow-sm",
                  `text-${stat.color}-500 border-${stat.color}-100`
                )}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={cn("px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest", `text-${stat.color}-600 border-${stat.color}-100`)}>
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
              </div>
            </div>
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
                <div key={course._id} className="group rounded-[36px] border border-slate-100 bg-white overflow-hidden hover:border-sky-300 transition-all duration-700 shadow-sm hover:shadow-2xl">
                  <div className="h-36 relative overflow-hidden">
                    <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-sky-100 shadow-sm">
                        {course.subject?.title || "Subject"}
                      </span>
                    </div>
                  </div>
                  <div className="p-7 space-y-5">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-tight uppercase tracking-tight">{course.title}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{course.tutor?.name || "Expert Tutor"}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</span>
                        <span className="text-xs font-black text-sky-600">0%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                          style={{ width: `0%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Enrollment</span>
                        <span className="text-xs font-bold text-slate-700">Active</span>
                      </div>
                      <Link href={`/dashboard/student/courses/${course._id}`}>
                        <button className="p-3.5 rounded-2xl bg-slate-900 text-white hover:bg-sky-500 transition-all shadow-lg group/btn">
                          <PlayCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {topCourses.length === 0 && !loading && (
                <div className="md:col-span-2 p-12 text-center rounded-[36px] border-2 border-dashed border-slate-100 bg-slate-50/30">
                   <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No courses enrolled yet</p>
                   <Link href="/dashboard/student/courses">
                     <Button variant="link" className="mt-2 text-sky-500 font-bold uppercase text-[10px]">Explore Catalog</Button>
                   </Link>
                </div>
              )}
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
              <Link href="/dashboard/student/quizzes" className="h-10 px-4 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                All Quizzes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <AssessmentList />

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

          {/* Latest Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Latest Results</h2>
              <Link href="/dashboard/student/grades" className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {latestResults.map((result) => (
                <div key={result.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-900 uppercase italic truncate">{result.title}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {result.subject} • {result.type}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-black text-sky-600">
                      {result.score}
                    </p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      {result.rank}
                    </p>
                  </div>
                </div>
              ))}
              {latestResults.length === 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No graded results yet</p>
                </div>
              )}
            </div>
          </div>

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
