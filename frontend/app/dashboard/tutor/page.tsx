"use client"

import {
    Users, BookOpen, Clock, Activity, Video,
    Sparkles, ArrowUpRight, GraduationCap,
    CheckCircle2, AlertCircle, Brain, Calendar,
    Plus, ChevronRight, BarChart3, TrendingUp, DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { mockTeacherData } from "@/lib/teacher-data"

export default function TeacherOverview() {
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
                            Welcome Back, <span className='text-sky-600'>{mockTeacherData.personal.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Your students are making progress. Today you have {mockTeacherData.schedule.filter(s => s.type === 'live').length} live classes scheduled.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-transform active:scale-95">
                            <Plus className="w-4 h-4 text-white" /> Create New Course
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all">
                            <Calendar className="w-4 h-4 mr-2" /> View Full Calendar
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[240px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Active Students</p>
                            <h2 className="text-2xl font-black text-slate-900">97</h2>
                        </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[240px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Class Average</p>
                            <h2 className="text-2xl font-black text-slate-900">{mockTeacherData.classAverage}%</h2>
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
                            <button className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 group">
                                View Catalog <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mockTeacherData.courses.map(course => (
                                <div
                                    key={course.id}
                                    className="group p-8 rounded-[40px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-500 cursor-pointer relative overflow-hidden"
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
                                                <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors uppercase italic">{course.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{course.studentCount} Students Enrolled</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Completion</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${course.completionRate}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-900">{course.completionRate}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Quizzes</p>
                                                <p className="text-[10px] font-black text-sky-600">{course.activeQuizzes} Quizzes</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Analytics Preview Card */}
                    <div className="p-10 rounded-[48px] bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-3xl rounded-full -mr-64 -mt-64" />
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="space-y-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase tracking-widest mb-4">AI Insight Engine</div>
                                    <h3 className="text-3xl font-black uppercase italic leading-none tracking-tighter">Student Readiness <span className="text-sky-400 block mt-2">Analysis</span></h3>
                                </div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    Our AI has analyzed the last Physics midterm scores. 12% of your Grade 12 students are struggling with derivation logic.
                                </p>
                                <Button className="h-12 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-500/20 group">
                                    Generate Intervention Plan <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                            </div>
                            <div className="flex justify-center lg:justify-end">
                                <div className="w-64 h-64 rounded-[40px] bg-white/5 border border-white/10 p-8 flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <BarChart3 className="w-8 h-8 text-sky-400" />
                                        <Activity className="w-5 h-5 text-sky-400" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-500 w-[78%]" />
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-400 w-[45%]" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Readiness: 72%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Schedule & Tasks */}
                <div className="space-y-10">

                    {/* Live Schedule */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Today's Schedule</h3>
                        <div className="space-y-4">
                            {mockTeacherData.schedule.map((item, idx) => (
                                <div key={idx} className="group p-6 rounded-[32px] bg-white border border-slate-100 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
                                            item.type === 'live' ? "bg-rose-50 border-rose-100 text-rose-500" :
                                                item.type === 'office' ? "bg-sky-50 border-sky-100 text-sky-500" :
                                                    "bg-sky-50 border-sky-100 text-sky-500"
                                        )}>
                                            {item.type === 'live' ? <Video className="w-5 h-5" /> :
                                                item.type === 'office' ? <Clock className="w-5 h-5" /> :
                                                    <GraduationCap className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.time}</span>
                                                {item.type === 'live' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                                            </div>
                                            <h4 className="text-[13px] font-black text-slate-900 leading-tight mb-1 truncate">{item.activity}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.course}</p>
                                        </div>
                                    </div>
                                    {item.type === 'live' && (
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <Button className="w-full h-10 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                                Join Live Session
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Tasks / Squads */}
                    <div className="p-10 rounded-[48px] bg-sky-600 text-white relative shadow-2xl shadow-sky-500/20 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">Grading Queue</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white">{mockTeacherData.pendingHomework}</span>
                                    <span className="text-xs font-black text-sky-300 uppercase tracking-widest">Pending</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {mockTeacherData.squads.map(squad => (
                                    <div key={squad.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-lg shadow-sky-500/50" />
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-tight">{squad.name}</p>
                                                <p className="text-[8px] font-medium text-sky-200 uppercase tracking-widest">{squad.studentCount} Students</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/50" />
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-white text-sky-600 font-black text-[10px] uppercase tracking-widest hover:bg-sky-50 shadow-xl transition-all">
                                Open Grading Hub
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
