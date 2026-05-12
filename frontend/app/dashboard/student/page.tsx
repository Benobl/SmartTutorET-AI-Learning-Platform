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

          s.on("grade-updated", (data: any) => {
            console.log("[Socket] Grade updated, refreshing dashboard stats")
            fetchData()
            toast.success("New Grade Available", {
              description: "An assignment has been graded. Your statistics have been updated.",
              icon: <GraduationCap className="w-4 h-4 text-emerald-500" />
            })
          })
        }
      }
    }

    return () => {
      const s = getSocket()
      if (s) {
        s.off("new-announcement")
        s.off("grade-updated")
      }
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
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-32 pt-4">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Student Portal</span>
          </div>
          <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
            Hello, <span className="font-semibold text-slate-900">{studentName}</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
            Your learning progress is currently at <span className="text-slate-900 font-bold">{stats?.avgProgress || 0}%</span>. Maintain your <span className="text-sky-500 font-bold">{stats?.streak || 0}-day streak</span> for maximum retention.
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => setIsAITutorOpen(true)} className="h-12 px-8 rounded-full bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-sm">
            Ask Neural Assistant
          </Button>
          <Button onClick={() => { setCollabType("create"); setIsStudyHubOpen(true); }} variant="outline" className="h-12 px-8 rounded-full border-slate-100 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-sm">
            Open Study Hub
          </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
        {[
          { label: "Overall Progress", value: stats ? `${stats.avgProgress || 0}%` : "..." },
          { label: "Quizzes Completed", value: stats ? String(stats.quizzesTaken) : "..." },
          { label: "Active Streak", value: stats ? `${stats.streak} Days` : "..." },
          { label: "Current GPA", value: stats ? String(stats.gpa) : "..." },
        ].map((s, i) => (
          <div key={i} className="p-10 rounded-[32px] bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500 group">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{s.value}</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1 h-1 rounded-full bg-sky-400" />
              <p className="text-[9px] font-medium text-slate-400 uppercase">System Sync: Live</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-4">
        
        {/* Main Content: 8 Columns */}
        <div className="xl:col-span-8 space-y-8">

          {/* Catalog Selection */}
          <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-slate-900 rounded-full" />
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Active Courses</h4>
              </div>
              <Link href="/dashboard/student/courses">
                <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {topCourses.map((course) => (
                <div key={course._id} className="group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{course.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">By {course.tutor?.name || "Instructor"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-6 md:mt-0">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${course.progress || Math.floor(Math.random() * 50) + 10}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{course.progress || 0}%</span>
                    </div>
                    <Link href={`/dashboard/student/courses/${course._id}`}>
                      <Button className="h-11 px-6 rounded-xl bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20">
                        Continue
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {topCourses.length === 0 && !loading && (
                <div className="py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active courses found</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Hub */}
          <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="space-y-6 max-w-xl text-center lg:text-left">
                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <div className="w-1 h-6 bg-slate-900 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Global Study Hub</h2>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Collaborate in real-time with peers from across the network. 
                    Share insights, solve complex modules, and grow together.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                    <Button
                      onClick={() => { setCollabType("invite"); setIsStudyHubOpen(true); }}
                      className="h-11 px-6 rounded-xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
                    >
                      <Users className="w-4 h-4 mr-2" /> Locate Peers
                    </Button>
                    <Button
                      onClick={() => { setCollabType("create"); setIsStudyHubOpen(true); }}
                      variant="outline"
                      className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      <Video className="w-4 h-4 mr-2" /> Quick Video Session
                    </Button>
                  </div>
               </div>
               <div className="hidden lg:block">
                  <div className="w-32 h-32 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-center relative">
                     <MessageSquare className="w-10 h-10 text-slate-400" />
                  </div>
               </div>
            </div>
          </div>

          <AssessmentList />
        </div>

        {/* Sidebar: 4 Columns */}
        <div className="xl:col-span-4 space-y-8">
          
          <Leaderboard grade={user?.grade || "9"} />

          {/* Clean Results Sidebar */}
          <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-slate-900 rounded-full" />
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Recent Results</h4>
              </div>
              <Link href="/dashboard/student/grades">
                <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">View All</Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {latestResults.map((result) => (
                <div key={result.id} className="p-6 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.type}</p>
                      <h4 className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{result.title}</h4>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black text-slate-900">{result.score}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{result.subject}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">{result.rank}</span>
                  </div>
                </div>
              ))}
              {latestResults.length === 0 && (
                <div className="py-12 text-center opacity-50">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No recent grades</p>
                </div>
              )}
            </div>
          </div>

          {/* Broadcasts */}
          <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-slate-900 rounded-full" />
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Broadcast Feed</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{announcements.length} Updates</span>
            </div>
            
            <div className="space-y-4">
              {announcements.slice(0, 3).map((ann) => {
                const config: any = {
                  exam: { label: "Exam", icon: BookOpen, color: "text-slate-900", bg: "bg-slate-50" },
                  holiday: { label: "Holiday", icon: Calendar, color: "text-slate-900", bg: "bg-slate-50" },
                  schedule: { label: "Schedule", icon: Clock, color: "text-slate-900", bg: "bg-slate-50" },
                  academic: { label: "Academic", icon: GraduationCap, color: "text-slate-900", bg: "bg-slate-50" },
                  administrative: { label: "Admin", icon: Building2, color: "text-slate-900", bg: "bg-slate-50" },
                  general: { label: "General", icon: Bell, color: "text-slate-900", bg: "bg-slate-50" },
                }[ann.category as string] || { label: "Notice", icon: Bell, color: "text-slate-900", bg: "bg-slate-50" };

                return (
                  <div key={ann._id} className="group flex flex-col p-6 rounded-[24px] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 group-hover:text-slate-900 transition-colors")}>
                        <config.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ann.title}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{config.label} • {new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {ann.body}
                    </p>
                  </div>
                );
              })}
              {announcements.length === 0 && (
                <div className="py-12 text-center opacity-50">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active broadcasts</p>
                </div>
              )}
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
