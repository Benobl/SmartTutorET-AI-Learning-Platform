"use client"
 
import { useState, useEffect, useCallback } from "react"

import Link from "next/link"
import {
    Users, BookOpen, Clock, Activity, Video,
    Sparkles, ArrowUpRight, GraduationCap,
    CheckCircle2, AlertCircle, Brain, Calendar,
    Plus, ChevronRight, BarChart3, TrendingUp, DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { tutorActivity, tutorCourses } from "@/lib/mock-data"
import { userApi, courseApi, schedulingApi } from "@/lib/api"

export default function TeacherOverview() {
    const [stats, setStats] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Upper Welcome Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100/50">Educator Portal</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Welcome Back, <span className='text-sky-600'>{stats?.firstName || "Teacher"}</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Your students are making progress. You have {courses.length} active courses currently.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/tutor/courses">
                            <Button className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-transform active:scale-95">
                                <Plus className="w-4 h-4 text-white" /> Create New Course
                            </Button>
                        </Link>
                        <Link href="/dashboard/tutor/schedule">
                            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all">
                                <Calendar className="w-4 h-4 mr-2" /> View Full Calendar
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[240px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Active Students</p>
                            <h2 className="text-2xl font-black text-slate-900">{stats?.activeStudents || "0"}</h2>
                        </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[240px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Class Average</p>
                            <h2 className="text-2xl font-black text-slate-900">{stats?.classAverage || "0"}%</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

                {/* Left Column: Courses & Stats */}
                <div className="xl:col-span-2 space-y-10">

                    {/* Active Courses Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Your Active Courses</h3>
                            <Link href="/dashboard/tutor/courses">
                                <button className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 group">
                                    View Catalog <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.map(course => (
                                <Link href={`/dashboard/tutor/courses`} key={course._id}>
                                    <div
                                        className="group p-8 rounded-[40px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-500 cursor-pointer relative overflow-hidden h-full"
                                    >
                                        <div className="absolute top-0 right-0 p-6">
                                            <span className="px-3 py-1 rounded-xl bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-slate-100">Grade {course.grade}</span>
                                        </div>
                                        <div className="space-y-6 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors uppercase italic">{course.title}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{course.students?.length || 0} Students Enrolled</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-sky-600 uppercase">{course.status}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Price</p>
                                                    <p className="text-[10px] font-black text-emerald-600">{course.price} ETB</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            ))}
                            {courses.length === 0 && !loading && (
                                <div className="md:col-span-2 p-12 text-center rounded-[36px] border-2 border-dashed border-slate-100 bg-slate-50/30">
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No courses created yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Schedule & Tasks */}
                <div className="space-y-10">

                    {/* Academic Agenda Table */}
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 blur-2xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight mb-1 text-slate-900">Academic <span className="text-sky-600">Agenda</span></h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned by Manager</p>
                                </div>
                                <Link href="/dashboard/tutor/timetable">
                                    <Button variant="ghost" size="sm" className="rounded-xl text-[9px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-50">
                                        Full Table <ChevronRight className="w-3 h-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-slate-50">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {schedule.length > 0 ? schedule.slice(0, 5).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group/row">
                                                <td className="px-6 py-4">
                                                    <p className="text-[10px] font-black text-slate-900">{item.startTime}</p>
                                                    <p className="text-[8px] font-medium text-slate-400 uppercase">{item.dayOfWeek}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Teaching Course</span>
                                                        <p className="text-[13px] font-black text-slate-900 uppercase italic leading-none group-hover:text-sky-600 transition-colors">{item.subject?.title}</p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 text-[8px] font-black uppercase">Grade {item.grade}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sem {item.semester || 1}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right italic text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                    Assigned
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    No assigned classes
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pending Tasks / Squads */}
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 blur-2xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight mb-2 text-slate-900">Grading Queue</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-sky-600">{stats?.pendingHomework || "0"}</span>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {courses.slice(0, 2).map((course, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-sky-50/50 border border-sky-100 hover:bg-sky-50 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-lg shadow-sky-500/50" />
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{course.title}</p>
                                                <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">{(course.students?.length || 0)} Students</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                            <Link href="/dashboard/tutor/grading" className="block">
                                <Button className="w-full h-14 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-sky-700 shadow-xl shadow-sky-500/20 transition-all">
                                    Open Grading Hub
                                </Button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
