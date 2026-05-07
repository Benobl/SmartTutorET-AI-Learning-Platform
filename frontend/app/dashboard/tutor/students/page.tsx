"use client"

import { useState, useEffect } from "react"
import {
    Users, Search, Filter, Mail, MessageSquare,
    ChevronRight, ArrowUpRight, TrendingUp, TrendingDown,
    Activity, GraduationCap, Star, BookOpen, Clock,
    LayoutGrid, List, MoreVertical, ShieldAlert, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { tutorStudents as centralizedStudents } from "@/lib/mock-data"

const MOCK_STUDENTS = centralizedStudents

export default function TeacherStudents() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatMessage, setChatMessage] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        loadStudents()
    }, [])

    const loadStudents = async () => {
        try {
            setLoading(true)
            const res = await courseApi.getMyStudents()
            setStudents(res.data || [])
        } catch (error: any) {
            toast({ title: "Failed to load students", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.course || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleMessageAll = () => {
        setIsBroadcastOpen(true)
    }

    const handleExportGradebook = () => {
        toast({
            title: "Export Initiated",
            description: "Generating comprehensive gradebook export (PDF/CSV)...",
        })
    }

    const handleMessageStudent = (student: any) => {
        setSelectedStudent(student)
        setIsChatOpen(true)
    }

    const handleViewProfile = (student: any) => {
        setSelectedStudent(student)
        setIsProfileOpen(true)
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Enrollment Portal</span>
                            <Activity className="w-4 h-4 text-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Student <span className='text-sky-500'>Directory</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Monitor student performance, track attendance, and provide personalized AI-driven feedback to improve exam readiness.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleMessageAll}
                            className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:bg-sky-700 hover:scale-105 transition-all"
                        >
                            <Mail className="w-4 h-4" /> Message All Students
                        </Button>
                        <Button
                            onClick={handleExportGradebook}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all"
                        >
                            <ArrowUpRight className="w-4 h-4 mr-2" /> Export Gradebook
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            placeholder="Find a student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Students", value: students.length.toString(), icon: Users, color: "bg-sky-50 text-sky-500" },
                    { label: "Courses Taught", value: Array.from(new Set(students.map(s => s.course))).length.toString(), icon: BookOpen, color: "bg-sky-50 text-sky-500" },
                    { label: "Avg Grade", value: students.length > 0 ? `${Math.round(students.reduce((acc, s) => acc + (s.average || 80), 0) / students.length)}%` : "0%", icon: Star, color: "bg-sky-50 text-sky-500" },
                    { label: "At Risk", value: students.filter(s => (s.average || 80) < 60).length.toString(), icon: ShieldAlert, color: "bg-rose-50 text-rose-500" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 flex items-center gap-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm", stat.color)}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <h2 className="text-2xl font-black text-slate-900">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Students Table/List */}
            <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-sky-500/5 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading student records...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No students found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/50">
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Course</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avg Score</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map((student) => (
                                    <tr key={student._id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center font-black text-xs border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm overflow-hidden">
                                                    {student.profile?.avatar ? (
                                                        <img src={student.profile.avatar} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        student.name.split(' ').map((n: string) => n[0]).join('')
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-[15px] font-black text-slate-900 leading-none mb-1.5">{student.name}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Grade {student.profile?.grade || student.grade} • {student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{student.course || "General"}</p>
                                                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Active Enrollment</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className="text-xl font-black text-sky-600">{student.average || 80}%</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                    (student.average || 80) >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-sky-50 text-sky-600 border-sky-100"
                                                )}>
                                                    {(student.average || 80) >= 80 ? "Excellent" : "On Track"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button
                                                    size="sm" variant="outline"
                                                    onClick={() => handleMessageStudent(student)}
                                                    className="h-10 w-10 rounded-xl p-0 border-slate-100 text-slate-400 hover:text-sky-600 transition-all"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleViewProfile(student)}
                                                    className="h-10 px-6 rounded-xl bg-sky-600 text-white font-black text-[9px] uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-500/20"
                                                >
                                                    Full Profile
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Broadcast Modal */}
                <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[32px] border-slate-100 p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-900 uppercase">Broadcast Message</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Send an announcement to all 97 students enrolled in your courses.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</label>
                                <Textarea
                                    placeholder="e.g. Remember to review the kinematics notes before tomorrow's quiz!"
                                    className="min-h-[150px] rounded-2xl bg-slate-50 border-slate-100 font-medium text-sm p-4 focus:ring-sky-500/20"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => {
                                setIsBroadcastOpen(false)
                                toast({
                                    title: "Broadcast Sent",
                                    description: "Your message has been queued for delivery to all students.",
                                })
                            }} className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-sky-500/20">
                                Send Broadcast <Mail className="w-4 h-4 ml-2" />
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Profile Sheet */}
                <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <SheetContent className="sm:max-w-md border-l-slate-100 p-0">
                        <div className="h-full flex flex-col">
                            <div className="p-8 bg-gradient-to-br from-sky-600 to-indigo-600 text-white relative overflow-hidden">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                <div className="relative z-10 space-y-6">
                                    <Avatar className="w-24 h-24 rounded-3xl border-4 border-white/10 shadow-2xl">
                                        <AvatarFallback className="bg-sky-500 text-white text-2xl font-black">
                                            {selectedStudent?.name.split(" ").map((n: string) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-3xl font-black">{selectedStudent?.name}</h2>
                                        <p className="text-sky-400 font-black uppercase tracking-widest text-[10px] mt-1">Grade {selectedStudent?.grade} • Student ID-8821</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current GPA</p>
                                        <p className="text-2xl font-black text-slate-900">{selectedStudent?.average}%</p>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                                        <p className="text-2xl font-black text-slate-900">{selectedStudent?.attendance}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Enrolled Courses</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-sky-200 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center font-black text-[10px]">QM</div>
                                                <p className="text-sm font-bold text-slate-700">{selectedStudent?.course}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-sky-50 border border-sky-100 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-sky-500" />
                                        <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">AI Performance Insight</p>
                                    </div>
                                    <p className="text-xs text-sky-700/80 font-medium leading-relaxed">
                                        {selectedStudent?.status === "excellent"
                                            ? "Exceptional performance in recent quizzes. Ready for advanced modules."
                                            : "Showing consistent improvement. Recommend focusing on quantum superposition derivations."}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100">
                                <Button className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-sky-500/20">
                                    View Full Academic Record
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Quick Chat Modal */}
                <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[32px] border-slate-100 p-0 overflow-hidden">
                        <div className="bg-sky-600 p-6 text-white flex items-center gap-4">
                            <Avatar className="w-12 h-12 rounded-2xl border-2 border-white/20">
                                <AvatarFallback className="bg-white/10 text-white font-black text-sm">
                                    {selectedStudent?.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-black text-lg">{selectedStudent?.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Direct Message Channel</p>
                            </div>
                        </div>

                        <div className="h-[300px] bg-slate-50 p-6 overflow-y-auto space-y-4">
                            <div className="flex justify-start">
                                <div className="max-w-[80%] bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                                    <p className="text-sm text-slate-700 font-medium">Hello teacher, regarding the assignment...</p>
                                    <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase">2 hours ago</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-100">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Type your message..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                />
                                <Button
                                    onClick={() => {
                                        toast({
                                            title: "Message Sent",
                                            description: `Your message has been sent to ${selectedStudent?.name}.`,
                                        })
                                        setIsChatOpen(false)
                                        setChatMessage("")
                                    }}
                                    className="h-12 w-12 rounded-xl bg-sky-600 text-white p-0 shadow-lg shadow-sky-500/20"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Showing 5 of 97 enrolled students</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest">Previous</Button>
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest">Next</Button>
                    </div>
                </div>
            </div>

        </div>
    )
}
