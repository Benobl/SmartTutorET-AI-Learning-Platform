"use client"

import { useState, useEffect, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen, Clock, Calendar, GraduationCap, ChevronRight,
  PlayCircle, Bell, FileText, AlertCircle, Sparkles,
  Zap, MessageSquare, Lightbulb, TrendingUp, Target, Users, Megaphone, Building2,
  ArrowUpRight, Layout, LayoutGrid, Activity, Star, Video
} from "lucide-react"
import { cn } from "@/lib/utils"
import { userApi, courseApi, assignmentApi, assessmentApi, announcementApi } from "@/lib/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// New Interactive Components
import { AITutorModal } from "@/components/dashboards/student/ai-tutor-modal"
import { CollaborationModals } from "@/components/dashboards/student/collaboration-modals"
import { ActivityHistoryModal } from "@/components/dashboards/student/activity-history-modal"
import { AssessmentList } from "@/components/dashboards/student/assessment-list"
import { Leaderboard } from "@/components/dashboards/student/leaderboard"

import { getCurrentUser } from "@/lib/auth-utils"
import { initializeSocket, getSocket } from "@/lib/socket"
import { toast } from "sonner"

/**
 * Student Dashboard Overview — High-Fidelity Premium UI
 */
export default function StudentOverview() {
  const [user, setUser] = useState<any>(null)
  const [isAITutorOpen, setIsAITutorOpen] = useState(false)
  const [isStudyHubOpen, setIsStudyHubOpen] = useState(false)
  const [collabType, setCollabType] = useState<"create" | "invite">("create")
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [assignmentResults, setAssignmentResults] = useState<any[]>([])
  const [quizResults, setQuizResults] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [upcomingAssessments, setUpcomingAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [readState, setReadState] = useState<Record<string, boolean>>({})

  // Initialize user from storage
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) setUser(currentUser)
  }, [])

  const studentName = user?.name?.split(" ")[0] || "Student"

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const saved = localStorage.getItem("read_announcements")
      if (saved) setReadState(JSON.parse(saved))

      const [statsRes, coursesRes, marksRes, quizRes, annRes, assessRes] = await Promise.allSettled([
        userApi.getStats(),
        courseApi.getMyCourses(),
        assignmentApi.getMyMarks(),
        assessmentApi.getSubmissions(),
        announcementApi.getAll(user?.grade),
        assessmentApi.getAll({ grade: user?.grade, status: "published" })
      ])
      if (statsRes.status === "fulfilled") setStats(statsRes.value?.data || null)
      if (coursesRes.status === "fulfilled") setEnrolledCourses(coursesRes.value?.data || [])
      if (marksRes.status === "fulfilled") setAssignmentResults(marksRes.value?.data || [])
      if (quizRes.status === "fulfilled") setQuizResults((quizRes.value?.data || []).filter((row: any) => row?.gradedAt))
      if (annRes.status === "fulfilled") setAnnouncements(annRes.value?.data || [])
      if (assessRes.status === "fulfilled") setUpcomingAssessments((assessRes.value?.data || []).slice(0, 4))
    } catch (error) {
      console.error("Failed to fetch student data", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchData()

      // Initialize Socket and Listen for Real-time Announcements
      if (user._id) {
        const s = initializeSocket(user._id)
        if (s) {
          s.on("new-announcement", (data: any) => {
            const targetGrade = data.targetGrade ? String(data.targetGrade) : ""
            const studentGrade = user?.grade ? String(user.grade) : ""
            
            if (!targetGrade || targetGrade === studentGrade) {
              setAnnouncements(prev => [data, ...prev])
              toast.info(`New Broadcast: ${data.title}`, {
                description: data.body.substring(0, 50) + "...",
                duration: 10000,
                icon: <Megaphone className="w-4 h-4 text-sky-500" />
              })
            }
          })
        }
      }
    }

    return () => {
      const s = getSocket()
      if (s) s.off("new-announcement")
    }
  }, [fetchData, user])

  const topCourses = enrolledCourses.slice(0, 6)
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
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 pb-32 pt-8 px-6 lg:px-10">

      {/* Ultra-Premium Welcome Banner */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-[60px] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
        <div className="relative bg-white border border-slate-100 p-12 lg:p-16 rounded-[60px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-3xl -mr-64 -mt-64 opacity-50"></div>
          
          <div className="relative z-10 space-y-8 max-w-2xl text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10">Academy Portal</span>
              <span className="px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] border border-sky-100/50">Level Up Available</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-light text-slate-800 tracking-tight leading-none">
                Hello, <span className="font-semibold text-slate-900 italic">{studentName}</span>
              </h1>
              <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed">
                Your neural progress is currently at <span className="text-slate-900 font-bold">88% efficiency</span>. 
                Maintain your <span className="text-sky-500 font-bold">12-day streak</span> for maximum retention.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => setIsAITutorOpen(true)}
                className="h-16 px-10 rounded-[28px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-sky-600/30 transition-all active:scale-95 gap-3"
              >
                <Sparkles className="w-5 h-5 fill-white/20" /> Ask Neural Assistant
              </Button>
              <Button
                onClick={() => { setCollabType("create"); setIsStudyHubOpen(true); }}
                variant="outline"
                className="h-16 px-10 rounded-[28px] border-slate-100 bg-white text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/20"
              >
                Open Study Hub
              </Button>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            <div className="w-64 h-64 rounded-[56px] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group/icon overflow-hidden">
               <GraduationCap className="w-24 h-24 text-slate-200 group-hover:scale-110 group-hover:text-sky-500 transition-all duration-700 -rotate-12" />
               <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-[32px] bg-white border border-slate-100 shadow-2xl flex items-center justify-center animate-bounce duration-[3s]">
               <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Neural Score", value: stats ? `${stats.gpa * 20}%` : "...", sub: "Overall Proficiency", icon: Activity, color: "text-sky-500", bg: "bg-sky-50" },
          { label: "Knowledge Nodes", value: stats ? String(stats.quizzesTaken) : "...", sub: "Cumulative Data", icon: Target, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Active Streak", value: stats ? String(stats.streak) : "...", sub: "Consistency Loop", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "GPA Tier", value: stats ? String(stats.gpa) : "...", sub: "Institutional Standing", icon: Star, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-10 rounded-[48px] bg-white border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
          >
            <div className={cn("absolute right-0 top-0 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity", stat.bg)} />
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-transparent group-hover:border-current transition-all", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Main Content: 8 Columns */}
        <div className="xl:col-span-8 space-y-16">

          {/* Catalog Selection */}
          <section className="space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Active Nodes</h2>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Your current knowledge trajectory</p>
              </div>
              <Link href="/dashboard/student/courses">
                <Button variant="ghost" className="rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all gap-2">
                  Full Catalog <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {topCourses.map((course) => (
                <div key={course._id} className="group rounded-[52px] bg-white border border-slate-100 overflow-hidden hover:border-sky-200 transition-all duration-700 shadow-sm hover:shadow-2xl">
                  <div className="h-48 relative overflow-hidden">
                    <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                    <div className="absolute top-6 left-6">
                      <span className="text-[9px] font-black text-sky-600 uppercase tracking-[0.2em] bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-sky-100/50 shadow-xl">
                        {course.subject?.title || "Course"}
                      </span>
                    </div>
                  </div>
                  <div className="p-10 pt-4 space-y-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-tight uppercase italic tracking-tight">{course.title}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Directed by {course.tutor?.name || "Neural Expert"}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Sync Status</span>
                        <span className="text-xs font-black text-sky-600">InProgress</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-600 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                          style={{ width: `45%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400 shadow-sm">U</div>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-sky-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-sky-600 shadow-sm">+12</div>
                      </div>
                      <Link href={`/dashboard/student/courses/${course._id}`}>
                        <Button className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
                          Engage Node
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {topCourses.length === 0 && !loading && (
                <div className="md:col-span-2 p-20 text-center rounded-[52px] border-2 border-dashed border-slate-100 bg-slate-50/20">
                   <LayoutGrid className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                   <h4 className="text-xl font-black text-slate-400 uppercase italic mb-2">Neural Void Detected</h4>
                   <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] mb-8 leading-relaxed">No active learning nodes have been established in your catalog.</p>
                   <Link href="/dashboard/student/courses">
                     <Button className="h-14 px-10 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-600/20">Explore Academy Catalog</Button>
                   </Link>
                </div>
              )}
            </div>
          </section>

          {/* Social Hub */}
          <section className="p-12 lg:p-16 rounded-[60px] bg-slate-900 text-white relative overflow-hidden group shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-1000 group-hover:scale-110" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="space-y-8 max-w-xl text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <span className="w-1.5 h-6 bg-indigo-400 rounded-full" />
                    <h2 className="text-3xl font-black uppercase tracking-tight italic">Global Study Hub</h2>
                  </div>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    Collaborate in real-time with peers from across the network. 
                    Share insights, solve complex modules, and grow together.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                    <Button
                      onClick={() => { setCollabType("invite"); setIsStudyHubOpen(true); }}
                      className="h-14 px-8 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-sky-50 transition-all shadow-2xl"
                    >
                      <Users className="w-4 h-4 mr-2" /> Locate Peers
                    </Button>
                    <Button
                      onClick={() => { setCollabType("create"); setIsStudyHubOpen(true); }}
                      variant="outline"
                      className="h-14 px-8 rounded-2xl border-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                    >
                      <Video className="w-4 h-4 mr-2" /> Quick Video Session
                    </Button>
                  </div>
               </div>
               <div className="hidden lg:block">
                  <div className="w-48 h-48 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center relative">
                     <Zap className="w-20 h-20 text-indigo-400/20 absolute animate-pulse" />
                     <MessageSquare className="w-12 h-12 text-white" />
                  </div>
               </div>
            </div>
          </section>

          <AssessmentList />
        </div>

        {/* Sidebar: 4 Columns */}
        <div className="xl:col-span-4 space-y-12">
          
          <Leaderboard grade={user?.grade || "9"} />

          {/* Ultra-Clean Results Sidebar */}
          <div className="p-10 rounded-[52px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Pulse Analytics</h2>
              <Link href="/dashboard/student/grades">
                <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black text-sky-600 uppercase tracking-widest hover:bg-sky-50">Logbook</Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {latestResults.map((result) => (
                <div key={result.id} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-sky-100 transition-all duration-500 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{result.type}</p>
                      <h4 className="text-sm font-black text-slate-900 uppercase italic truncate max-w-[120px]">{result.title}</h4>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black text-sky-600">{result.score}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{result.subject}</span>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.1em]">{result.rank}</span>
                  </div>
                </div>
              ))}
              {latestResults.length === 0 && (
                <div className="py-12 text-center opacity-30">
                  <TrendingUp className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting graded intel</p>
                </div>
              )}
            </div>
          </div>

          {/* Broadcasts */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Broadcast Feed</h2>
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20">Syncing</span>
            </div>
            
            <div className="space-y-6">
              {announcements.slice(0, 3).map((ann) => {
                const config: any = {
                  exam: { label: "Exam Protocol", icon: BookOpen, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", glow: "bg-rose-500" },
                  holiday: { label: "Network Offline", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", glow: "bg-emerald-500" },
                  schedule: { label: "Schedule Drift", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", glow: "bg-amber-500" },
                  academic: { label: "Academic Intel", icon: GraduationCap, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100", glow: "bg-sky-500" },
                  administrative: { label: "Registrar Hub", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", glow: "bg-indigo-500" },
                  general: { label: "Global Notice", icon: Bell, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", glow: "bg-slate-500" },
                }[ann.category as string] || { label: "Notice", icon: Bell, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", glow: "bg-slate-500" };

                return (
                  <div key={ann._id} className="group relative p-10 rounded-[48px] border border-slate-100 bg-white hover:border-sky-200 hover:shadow-2xl transition-all duration-700 overflow-hidden">
                    <div className={cn("absolute right-0 top-0 w-32 h-32 blur-3xl rounded-full opacity-5 transition-all group-hover:scale-150 group-hover:opacity-20", config.glow)} />
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm", config.bg, config.border, config.color)}>
                        <config.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none", config.color)}>{config.label}</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase">{new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 mb-4 leading-tight uppercase italic tracking-tight group-hover:text-sky-600 transition-colors">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">
                      {ann.body}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic truncate max-w-[120px]">
                        Auth: {ann.role === 'tutor' ? (ann.createdBy?.name || "Tutor") : "Registrar"}
                      </span>
                      <Button variant="ghost" className="h-10 px-5 rounded-xl text-sky-500 font-black text-[10px] uppercase tracking-widest hover:bg-sky-50 transition-all border border-transparent hover:border-sky-100">
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
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
