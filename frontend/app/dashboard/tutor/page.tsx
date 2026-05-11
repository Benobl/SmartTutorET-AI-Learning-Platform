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

            {/* Premium Educator Welcome Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[60px] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
                <div className="relative bg-white border border-slate-100 p-12 lg:p-16 rounded-[60px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50 rounded-full blur-3xl -mr-64 -mt-64 opacity-50 transition-all duration-1000 group-hover:scale-110"></div>
                    
                    <div className="relative z-10 space-y-8 max-w-2xl text-center lg:text-left">
                        <div className="flex items-center gap-3 justify-center lg:justify-start">
                            <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-sky-400 fill-sky-400" /> Educator Node
                            </span>
                            <span className="px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] border border-sky-100/50">Instruction Active</span>
                        </div>
                        
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-7xl font-light text-slate-800 tracking-tight leading-none">
                                Welcome Back, <span className="font-semibold text-slate-900 italic">{teacherName}</span>
                            </h1>
                            <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed">
                                Your instructional impact is rising. You are currently directing <span className="text-slate-900 font-bold">{courses.length} active learning paths</span> 
                                across <span className="text-sky-600 font-bold">{stats?.activeStudents || 0} students</span>.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                            <Link href="/dashboard/tutor/courses">
                                <Button className="h-16 px-10 rounded-[28px] bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-sky-600/30 transition-all active:scale-95 gap-3">
                                    <Plus className="w-5 h-5" /> Architect New Course
                                </Button>
                            </Link>
                            <Link href="/dashboard/tutor/live">
                                <Button variant="outline" className="h-16 px-10 rounded-[28px] border-slate-100 bg-white text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/20 gap-3">
                                    <Video className="w-5 h-5 text-rose-500" /> Start Live Hub
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-10 hidden lg:block">
                        <div className="w-64 h-64 rounded-[56px] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group/icon overflow-hidden">
                           <Presentation className="w-24 h-24 text-slate-200 group-hover:scale-110 group-hover:text-sky-500 transition-all duration-700 rotate-3" />
                           <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent"></div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-[32px] bg-white border border-slate-100 shadow-2xl flex items-center justify-center animate-bounce duration-[4s]">
                           <TrendingUp className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Active Students", value: stats?.activeStudents || "0", sub: "Network Size", icon: Users, color: "text-sky-500", bg: "bg-sky-50" },
                    { label: "Class Average", value: `${stats?.classAverage || "0"}%`, sub: "Knowledge Transfer", icon: Brain, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Pending Reviews", value: stats?.pendingHomework || "0", sub: "Grading Loop", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Earning Node", value: `${stats?.totalEarnings || "0"} ETB`, sub: "Value Exchange", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
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
                <div className="xl:col-span-4 space-y-12">

                    {/* Premium Agenda Hub */}
                    <div className="p-10 rounded-[52px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 blur-2xl rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150 group-hover:opacity-30" />
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900">Academic <span className="text-sky-600">Agenda</span></h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Managed Schedule</p>
                                </div>
                                <Link href="/dashboard/tutor/timetable">
                                    <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-50">Timeline</Button>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {schedule.length > 0 ? schedule.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-sky-100 transition-all duration-500 group/item relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm text-slate-400 group-hover/item:text-sky-600 transition-colors">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{item.startTime}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.dayOfWeek}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic group-hover/item:text-emerald-500 transition-colors">Live Node</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[14px] font-black text-slate-900 uppercase italic leading-tight group-hover/item:text-sky-600 transition-colors">{item.subject?.title}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade {item.grade} Hub</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEM {item.semester || 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center opacity-30">
                                        <Calendar className="w-12 h-12 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No assigned nodes</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Intelligence & Grading Queue */}
                    <div className="p-10 rounded-[52px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 relative group overflow-hidden">
                        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full opacity-50" />
                        <div className="relative z-10 space-y-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900">Grading <span className="text-sky-600">Sync</span></h3>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Awaiting assessment intel</p>
                            </div>
                            
                            <div className="flex items-baseline gap-4">
                                <span className="text-7xl font-black text-sky-600 tracking-tighter">{stats?.pendingHomework || "0"}</span>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-900 uppercase italic">Pending Data</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Requires Neural Validation</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {courses.slice(0, 2).map((course, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-sky-100 transition-all duration-500 cursor-pointer shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-lg shadow-sky-500/30" />
                                            <div>
                                                <p className="text-[12px] font-black uppercase tracking-tight text-slate-900">{course.title}</p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">{(course.students?.length || 0)} Learners active</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-200" />
                                    </div>
                                ))}
                            </div>
                            
                            <Link href="/dashboard/tutor/grading" className="block pt-4">
                                <Button className="w-full h-16 rounded-[28px] bg-slate-900 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 transition-all active:scale-95">
                                    Initialize Grading Hub
                                </Button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>


        </div>
    )
}
