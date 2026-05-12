"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
    Users, BookOpen, Clock, Activity, Video,
    Sparkles, ArrowUpRight, GraduationCap,
    CheckCircle2, AlertCircle, Brain, Calendar,
    Plus, ChevronRight, BarChart3, TrendingUp, DollarSign,
    Zap, Star, Target, Layout, Presentation, Megaphone, MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { userApi, courseApi, schedulingApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth-utils"

/**
 * Tutor Dashboard Overview — Ultra-Premium Educator Hub
 */
export default function TeacherOverview() {
    const [stats, setStats] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsRes, coursesRes, scheduleRes] = await Promise.all([
                userApi.getTutorStats(),
                courseApi.getMyCourses(),
                schedulingApi.getMySchedule()
            ]);
            setStats(statsRes.data);
            setCourses(coursesRes.data);
            setSchedule(scheduleRes.data || []);
        } catch (error) {
            console.error("Failed to fetch tutor data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentUser(getCurrentUser());
        fetchData();
    }, [fetchData]);

    const teacherName = stats?.firstName || currentUser?.name?.split(" ")[0] || "Educator";

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32 pt-8 px-6 lg:px-10">

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tutor Portal</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Welcome, <span className="font-semibold text-slate-900">{teacherName}</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                        Your instructional impact is rising. You are currently directing <span className="text-slate-900 font-bold">{courses.length} active learning paths</span> across <span className="text-sky-600 font-bold">{stats?.activeStudents || 0} students</span>.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Link href="/dashboard/tutor/courses">
                        <Button className="h-12 px-8 rounded-full bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-sm">
                            <Plus className="w-4 h-4 mr-2" /> New Course
                        </Button>
                    </Link>
                    <Link href="/dashboard/tutor/live">
                        <Button variant="outline" className="h-12 px-8 rounded-full border-slate-100 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50">
                            <Video className="w-4 h-4 mr-2 text-rose-500" /> Live Hub
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Impact Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
                {[
                    { label: "Active Students", value: stats?.activeStudents || "0" },
                    { label: "Class Average", value: `${stats?.classAverage || "0"}%` },
                    { label: "Pending Reviews", value: stats?.pendingHomework || "0" },
                    { label: "Earning Node", value: `${stats?.totalEarnings || "0"} ETB` },
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

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

                {/* Main Content Area */}
                <div className="xl:col-span-8 space-y-16">

                    {/* Educational Catalog */}
                    <section className="space-y-10">
                        <div className="flex items-center justify-between px-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Course Hub</h2>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Your managed instructional modules</p>
                            </div>
                            <Link href="/dashboard/tutor/courses">
                                <Button variant="ghost" className="rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all gap-2">
                                    Manage All <ArrowUpRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {courses.map(course => (
                                <Link href={`/dashboard/tutor/courses`} key={course._id}>
                                    <div className="group relative p-10 rounded-[52px] bg-white border border-slate-100 hover:border-sky-200 transition-all duration-700 shadow-sm hover:shadow-2xl overflow-hidden h-full">
                                        <div className="absolute top-0 right-0 p-8">
                                            <span className="px-4 py-1.5 rounded-xl bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">Grade {course.grade}</span>
                                        </div>
                                        
                                        <div className="space-y-8 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[24px] bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm border border-sky-100/50">
                                                    <BookOpen className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors uppercase italic tracking-tight">{course.title}</h4>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{course.students?.length || 0} Learners Managed</p>
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sync Status</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight">{course.status}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Node Value</p>
                                                    <p className="text-lg font-black text-emerald-600">{course.price} <span className="text-[10px] text-slate-400">ETB</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>
                                </Link>
                            ))}
                            {courses.length === 0 && !loading && (
                                <div className="md:col-span-2 p-20 text-center rounded-[52px] border-2 border-dashed border-slate-100 bg-slate-50/20">
                                    <Layout className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                    <h4 className="text-xl font-black text-slate-400 uppercase italic mb-2">Knowledge Desert</h4>
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] mb-8 leading-relaxed">You haven't established any learning paths yet.</p>
                                    <Link href="/dashboard/tutor/courses">
                                        <Button className="h-14 px-10 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-600/20">Initialize Course</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Operational Status */}
                    <section className="p-12 lg:p-16 rounded-[60px] bg-slate-900 text-white relative overflow-hidden group shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-1000 group-hover:scale-110" />
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="space-y-8 max-w-xl text-center lg:text-left">
                                <div className="flex items-center gap-3 justify-center lg:justify-start">
                                    <div className="w-1.5 h-6 bg-sky-400 rounded-full" />
                                    <h2 className="text-3xl font-black uppercase tracking-tight italic">Global Broadcast Hub</h2>
                                </div>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                    Communicate instantly with your student network. 
                                    Push critical updates, academic notices, and institutional alerts.
                                </p>
                                <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                                    <Link href="/dashboard/tutor/announcements">
                                        <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-sky-50 transition-all shadow-2xl">
                                            <Megaphone className="w-4 h-4 mr-2" /> Push Broadcast
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/tutor/messages">
                                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
                                            <MessageSquare className="w-4 h-4 mr-2" /> Neural Comms
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="w-48 h-48 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center relative">
                                    <Activity className="w-20 h-20 text-sky-400/20 absolute animate-pulse" />
                                    <Brain className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Sidebar Panel */}
                <div className="xl:col-span-4 space-y-8">

                    {/* Premium Agenda Hub */}
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-1 h-6 bg-slate-900 rounded-full" />
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Academic Agenda</h4>
                            </div>
                            <Link href="/dashboard/tutor/timetable">
                                <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Timeline</Button>
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {schedule.length > 0 ? schedule.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="p-6 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 text-slate-400">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{item.startTime}</p>
                                                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{item.dayOfWeek}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Node</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100/50">
                                        <p className="text-sm font-bold text-slate-900 truncate">{item.subject?.title}</p>
                                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Grade {item.grade} • SEM {item.semester || 1}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center opacity-50">
                                    <Calendar className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No assigned nodes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Intelligence & Grading Queue */}
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-slate-900 rounded-full" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Grading Sync</h4>
                        </div>
                        
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-black text-sky-600 tracking-tighter">{stats?.pendingHomework || "0"}</span>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900">Pending Data</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Requires Validation</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {courses.slice(0, 2).map((course, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-[20px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{course.title}</p>
                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{(course.students?.length || 0)} active</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </div>
                            ))}
                        </div>
                        
                        <Link href="/dashboard/tutor/grading" className="block pt-2">
                            <Button className="w-full h-11 rounded-xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-sky-700 transition-all shadow-sm">
                                Initialize Grading Hub
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>


        </div>
    )
}
