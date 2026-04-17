"use client"

import { useState } from "react"
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
    const [searchQuery, setSearchQuery] = useState("")
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatMessage, setChatMessage] = useState("")
    const { toast } = useToast()

    const filteredStudents = MOCK_STUDENTS.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.course.toLowerCase().includes(searchQuery.toLowerCase())
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
                            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border">Enrollment Portal</span>
                            <Activity className="w-4 h-4 text-sky-500" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-none mb-3 uppercase">
                            Student <span className='text-sky-600'>Directory</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium max-w-md">
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
                            className="h-14 px-8 rounded-2xl border-border bg-card text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-sky-500 hover:bg-sky-500/10 transition-all"
                        >
                            <ArrowUpRight className="w-4 h-4 mr-2" /> Export Gradebook
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-sky-500 transition-colors" />
                        <input
                            placeholder="Find a student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-card border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/50 transition-all placeholder:text-muted-foreground shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Students", value: "97", icon: Users, color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
                    { label: "Avg Attendance", value: "91%", icon: Clock, color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
                    { label: "Exam Ready", value: "64", icon: Star, color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
                    { label: "At Risk", value: "8", icon: ShieldAlert, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[40px] bg-card border border-border shadow-xl shadow-black/10 flex items-center gap-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm", stat.color)}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <h2 className="text-2xl font-black text-foreground">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Students Table/List */}
            <div className="bg-card rounded-[48px] border border-border shadow-2xl shadow-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-10 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Course</th>
                                <th className="px-10 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">GPA / Score</th>
                                <th className="px-10 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Attendance</th>
                                <th className="px-10 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="group hover:bg-muted/50 transition-all cursor-pointer">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-xs border border-sky-500/20 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="text-[15px] font-black text-foreground leading-none mb-1.5">{student.name}</h4>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Grade {student.grade} • ID-8821</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div>
                                            <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{student.course}</p>
                                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Semester 1</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={cn(
                                                    "text-xl font-black",
                                                    student.average >= 85 ? "text-sky-600" :
                                                        student.average >= 70 ? "text-sky-600" :
                                                            "text-rose-600"
                                                )}>{student.average}%</span>
                                                {student.trend === 'up' ? <TrendingUp className="w-4 h-4 text-sky-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                student.status === 'excellent' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
                                                    student.status === 'good' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
                                                        "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                            )}>{student.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-[13px] font-black text-muted-foreground">{student.attendance}</span>
                                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-sky-500 rounded-full" style={{ width: student.attendance }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Button
                                                size="sm" variant="outline"
                                                onClick={() => handleMessageStudent(student)}
                                                className="h-10 w-10 rounded-xl p-0 border-border bg-card text-muted-foreground hover:text-sky-500 transition-all"
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
                </div>

                {/* Broadcast Modal */}
                <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[32px] border-border bg-card p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-foreground uppercase">Broadcast Message</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium">
                                Send an announcement to all 97 students enrolled in your courses.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message Content</label>
                                <Textarea
                                    placeholder="e.g. Remember to review the kinematics notes before tomorrow's quiz!"
                                    className="min-h-[150px] rounded-2xl bg-muted border-border font-medium text-sm p-4 focus:ring-sky-500/20 text-foreground placeholder:text-muted-foreground"
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
                    <SheetContent className="sm:max-w-md border-l-border bg-card p-0">
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
                                        <p className="text-sky-300 font-black uppercase tracking-widest text-[10px] mt-1">Grade {selectedStudent?.grade} • Student ID-8821</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-card">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-3xl bg-muted border border-border">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current GPA</p>
                                        <p className="text-2xl font-black text-foreground">{selectedStudent?.average}%</p>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-muted border border-border">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Attendance</p>
                                        <p className="text-2xl font-black text-foreground">{selectedStudent?.attendance}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Enrolled Courses</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-2xl border border-border flex items-center justify-between group hover:border-sky-500/50 transition-all bg-muted">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-[10px]">QM</div>
                                                <p className="text-sm font-bold text-foreground">{selectedStudent?.course}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-sky-500/10 border border-sky-500/20 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-sky-500" />
                                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">AI Performance Insight</p>
                                    </div>
                                    <p className="text-xs text-sky-200/80 font-medium leading-relaxed">
                                        {selectedStudent?.status === "excellent"
                                            ? "Exceptional performance in recent quizzes. Ready for advanced modules."
                                            : "Showing consistent improvement. Recommend focusing on quantum superposition derivations."}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border bg-card">
                                <Button className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-sky-500/20">
                                    View Full Academic Record
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Quick Chat Modal */}
                <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[32px] border-border bg-card p-0 overflow-hidden">
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

                        <div className="h-[300px] bg-muted p-6 overflow-y-auto space-y-4">
                            <div className="flex justify-start">
                                <div className="max-w-[80%] bg-card p-4 rounded-2xl rounded-bl-none shadow-sm border border-border">
                                    <p className="text-sm text-foreground font-medium">Hello teacher, regarding the assignment...</p>
                                    <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase">2 hours ago</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-card border-t border-border">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Type your message..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="h-12 rounded-xl bg-muted border-border text-foreground placeholder:text-muted-foreground"
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

                <div className="p-8 bg-muted/50 border-t border-border flex items-center justify-between">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Showing 5 of 97 enrolled students</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border bg-card text-muted-foreground hover:text-sky-500 text-[10px] font-black uppercase tracking-widest">Previous</Button>
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border bg-card text-muted-foreground hover:text-sky-500 text-[10px] font-black uppercase tracking-widest">Next</Button>
                    </div>
                </div>
            </div>

        </div>
    )
}
