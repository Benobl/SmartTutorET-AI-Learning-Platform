"use client"

import { useState } from "react"
import {
    ClipboardList, Plus, Search, Filter,
    Clock, CheckCircle2, AlertCircle, FileText,
    ArrowUpRight, MessageSquare, GraduationCap,
    Users, Calendar, Sparkles, ChevronRight,
    Star, Timer, Send
} from "lucide-react"
import { cn } from "@/lib/utils"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { tutorProfile as mockTeacherData } from "@/lib/mock-data"

const MOCK_ASSIGNMENTS = [
    {
        id: "a1",
        title: "Wave-Particle Duality Derivation",
        course: "Quantum Mechanics Intro",
        grade: "12",
        submissions: 42,
        total: 45,
        graded: 28,
        due: "Tomorrow, 23:59",
        priority: "high",
        status: "active"
    },
    {
        id: "a2",
        title: "Projectile Motion Worksheet",
        course: "Kinematics & Dynamics",
        grade: "11",
        submissions: 52,
        total: 52,
        graded: 52,
        due: "Completed",
        priority: "low",
        status: "completed"
    },
    {
        id: "a3",
        title: "Hydraulic Systems Lab Report",
        course: "Fluid Mechanics",
        grade: "10",
        submissions: 14,
        total: 38,
        graded: 0,
        due: "In 3 days",
        priority: "medium",
        status: "active"
    }
]

export default function TeacherHomework() {
    const { toast } = useToast()
    const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS)
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all")
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [isGradingOpen, setIsGradingOpen] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
    const [viewingSubmission, setViewingSubmission] = useState<any>(null)
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        course: "",
        due: "",
        priority: "medium"
    })

    const handleAssign = () => {
        setIsAssignModalOpen(true)
    }

    const handleOpenGrading = (assignment: any) => {
        setSelectedAssignment(assignment)
        setIsGradingOpen(true)
    }

    const submitNewAssignment = () => {
        const selectedCourse = mockTeacherData.courses.find(c => c.id === newAssignment.course)
        const assignment = {
            id: `a${Date.now()}`,
            title: newAssignment.title,
            course: selectedCourse?.name || "Unknown",
            grade: selectedCourse?.grade || "12",
            submissions: 0,
            total: 45,
            graded: 0,
            due: newAssignment.due || "TBD",
            priority: newAssignment.priority,
            status: "active" as const
        }

        setAssignments([assignment, ...assignments])
        toast({
            title: "Task Assigned",
            description: `Successfully assigned "${newAssignment.title}" to Grade ${assignment.grade} Students.`,
        })
        setIsAssignModalOpen(false)
        setNewAssignment({ title: "", course: "", due: "", priority: "medium" })
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border">Workflow Manager</span>
                            <Sparkles className="w-4 h-4 text-sky-500 fill-sky-500/50" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-none mb-3 uppercase">
                            Grading <span className='text-sky-600'>Hub</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium max-w-md">
                            Review submissions, provide qualitative feedback, and manage academic deadlines for your assigned grade levels.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleAssign}
                            className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-transform"
                        >
                            <Plus className="w-4 h-4 text-white" /> Assign New Task
                        </Button>
                        <Button
                            onClick={() => toast({ title: "Bulk Grading", description: "Mode activated. Select multiple assignments to grade." })}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-border bg-card text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-sky-500 hover:bg-sky-500/10 transition-all"
                        >
                            <Timer className="w-4 h-4 mr-2" /> Bulk Grading Mode
                        </Button>
                    </div>
                </div>

                <div className="bg-muted/80 backdrop-blur-md p-1.5 rounded-[28px] border border-border shadow-inner flex gap-1 w-fit">
                    {[
                        { id: 'all', label: 'All Tasks', icon: ClipboardList },
                        { id: 'active', label: 'Active', icon: Timer },
                        { id: 'completed', label: 'Graded', icon: CheckCircle2 },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveFilter(t.id as any)}
                            className={cn(
                                "h-12 px-8 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5",
                                activeFilter === t.id
                                    ? "bg-card text-sky-500 shadow-xl shadow-sky-500/10 border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {assignments.filter(a => activeFilter === 'all' || a.status === activeFilter).map((assignment) => (
                    <div
                        key={assignment.id}
                        className="group p-10 rounded-[48px] bg-card border border-border shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <span className={cn(
                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border",
                                assignment.priority === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                    assignment.priority === 'medium' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
                                        "bg-muted text-muted-foreground border-border"
                            )}>
                                {assignment.priority} Priority
                            </span>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform shadow-sm">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground leading-tight mb-2 group-hover:text-sky-600 transition-colors uppercase italic">{assignment.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{assignment.course}</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="text-[10px] font-bold text-muted-foreground">Grade {assignment.grade}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 rounded-[28px] bg-muted border border-border">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Submissions</p>
                                    <p className="text-xl font-black text-foreground">{assignment.submissions}<span className="text-xs text-muted-foreground">/{assignment.total}</span></p>
                                </div>
                                <div className="p-6 rounded-[28px] bg-muted border border-border">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Graded</p>
                                    <p className="text-xl font-black text-sky-500">{assignment.graded}</p>
                                </div>
                                <div className="p-6 rounded-[28px] bg-muted border border-border">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Deadline</p>
                                    <p className={cn("text-xs font-black uppercase tracking-tight truncate", assignment.due === 'Completed' ? "text-sky-500" : "text-rose-500")}>
                                        {assignment.due}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span>Grading Progress</span>
                                    <span>{Math.round((assignment.graded / assignment.submissions) * 100 || 0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sky-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${(assignment.graded / assignment.submissions) * 100 || 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-between">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center shadow-sm text-muted-foreground">
                                            <Users className="w-5 h-5" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-border">
                                        +38
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleOpenGrading(assignment)}
                                    className="h-14 px-10 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-sm hover:bg-sky-500/20 transition-all"
                                >
                                    Open Grading Panel <ChevronRight className="w-4 h-4 text-sky-500" />
                                </Button>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>

            {/* AI Assistant Insight */}
            <div className="bg-card rounded-[64px] border border-border p-12 lg:p-20 relative overflow-hidden group shadow-2xl shadow-black/50">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/5 blur-3xl rounded-full -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-[2000ms]" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-widest mb-6 border border-sky-500/20">Workflow Optimization</div>
                            <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-none tracking-tight uppercase italic">Automated<span className="text-sky-600">Review</span> System</h2>
                        </div>
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg">
                            Boost your efficiency with AI-powered script analysis. Automatically identify key concepts, calculate suggested scores, and generate detailed feedback loops.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <Button className="h-16 px-10 rounded-2xl bg-sky-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 transition-all">
                                Activate Assistant
                            </Button>
                            <Button variant="outline" className="h-16 px-10 rounded-2xl border-border bg-card text-muted-foreground font-black text-xs uppercase tracking-widest hover:text-sky-500 hover:bg-sky-500/10 transition-all">
                                Documentation
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full max-w-sm aspect-square rounded-[64px] bg-muted border border-border shadow-inner p-10 relative overflow-hidden flex flex-col justify-center gap-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-card shadow-sm flex items-center justify-center border border-border">
                                    <Sparkles className="w-7 h-7 text-sky-500" />
                                </div>
                                <div className="h-3 flex-1 bg-card rounded-full shadow-sm border border-border" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-3 w-4/5 bg-card rounded-full shadow-sm border border-border" />
                                <div className="h-3 w-full bg-card rounded-full shadow-sm border border-border" />
                                <div className="h-3 w-3/5 bg-card rounded-full shadow-sm border border-border" />
                            </div>
                            <div className="pt-10 flex justify-end">
                                <div className="w-20 h-20 rounded-[32px] bg-sky-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-sky-500/30 ring-8 ring-muted">92</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Task Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[32px] bg-card border-border p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-foreground uppercase italic">Assign New <span className="text-sky-600">Task</span></DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Create a new assignment for your students. They will receive an immediate notification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignment Title</label>
                            <Input
                                placeholder="e.g. Einstein's Energy Equation Derivation"
                                value={newAssignment.title}
                                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                className="h-14 rounded-2xl bg-muted border-border font-bold focus:ring-sky-500/20"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Course</label>
                                <Select onValueChange={(v) => setNewAssignment({ ...newAssignment, course: v })}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-muted border-border font-bold focus:ring-sky-500/20">
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border bg-card">
                                        {mockTeacherData.courses.map(course => (
                                            <SelectItem key={course.id} value={course.id} className="rounded-xl font-bold">{course.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority</label>
                                <Select onValueChange={(v) => setNewAssignment({ ...newAssignment, priority: v })} defaultValue="medium">
                                    <SelectTrigger className="h-14 rounded-2xl bg-muted border-border font-bold focus:ring-sky-500/20">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border bg-card">
                                        <SelectItem value="high" className="rounded-xl font-bold">High</SelectItem>
                                        <SelectItem value="medium" className="rounded-xl font-bold">Medium</SelectItem>
                                        <SelectItem value="low" className="rounded-xl font-bold">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</label>
                            <Input
                                type="date"
                                value={newAssignment.due}
                                onChange={(e) => setNewAssignment({ ...newAssignment, due: e.target.value })}
                                className="h-14 rounded-2xl bg-muted border-border font-bold focus:ring-sky-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Instructions (Optional)</label>
                            <Textarea
                                placeholder="Describe the requirements..."
                                className="min-h-[100px] rounded-2xl bg-muted border-border font-medium p-4 focus:ring-sky-500/20"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={submitNewAssignment} disabled={!newAssignment.title || !newAssignment.course} className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-sky-500/20">
                            Confirm and Notify Students <Send className="w-4 h-4 ml-2" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Grading Panel Modal */}
            <Dialog open={isGradingOpen} onOpenChange={setIsGradingOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[32px] bg-card border-border p-0 overflow-hidden shadow-2xl shadow-black/50">
                    <div className="bg-sky-600 p-8 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-sky-400" />
                                <h2 className="text-xl font-black uppercase italic tracking-tight">{selectedAssignment?.title}</h2>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">Grading Panel</span>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Scripts</p>
                                <p className="text-2xl font-black">{selectedAssignment?.submissions}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Graded</p>
                                <p className="text-2xl font-black text-sky-400">{selectedAssignment?.graded}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Target Score</p>
                                <p className="text-2xl font-black text-amber-400">100</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 max-h-[600px] overflow-y-auto space-y-8">
                        {/* Submission Preview Toggle */}
                        {viewingSubmission ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setViewingSubmission(null)}
                                        className="text-sky-500 font-black text-[10px] uppercase tracking-widest p-0 h-auto hover:bg-transparent"
                                    >
                                        ← Back to Submission List
                                    </Button>
                                    <div className="px-3 py-1 rounded-full bg-muted text-[9px] font-black uppercase text-muted-foreground tracking-widest border border-border">Viewing Script</div>
                                </div>
                                <div className="p-10 rounded-[40px] bg-muted border border-border space-y-6 shadow-inner">
                                    <div className="flex items-center justify-between border-b border-border pb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Student</p>
                                            <p className="text-xl font-black text-foreground">{viewingSubmission.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Submitted</p>
                                            <p className="text-sm font-bold text-foreground">{viewingSubmission.date}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-foreground leading-relaxed italic">
                                            "Attached is my derivation of the Schrodinger wave equation for a 1D potential well. I've focused on the normalization constant and the boundary conditions at x=0 and x=L..."
                                        </p>
                                        <div className="h-[200px] rounded-24px bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 group/file cursor-pointer hover:border-sky-500/50 transition-all">
                                            <FileText className="w-10 h-10 text-muted-foreground group-hover/file:text-sky-400 transition-colors" />
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">derivation_final.pdf (2.4MB)</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Award Score</label>
                                            <Input placeholder="0 - 100" className="h-12 rounded-xl bg-card border-border text-center font-bold text-lg" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Feedback</label>
                                            <Input placeholder="Excellent work..." className="h-12 rounded-xl bg-card border-border font-bold" />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            toast({
                                                title: "Grade Submitted",
                                                description: `Successfully awarded score to ${viewingSubmission.name}.`,
                                            })
                                            setViewingSubmission(null)
                                        }}
                                        className="w-full h-14 rounded-2xl bg-sky-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-sky-500/20"
                                    >
                                        Submit Final Grade
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Submissions</h3>
                                    <Button
                                        onClick={() => toast({ title: "AI Review Initiated", description: "Calculating suggested grades based on marking key..." })}
                                        size="sm"
                                        className="h-9 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 font-black text-[9px] uppercase tracking-widest hover:bg-sky-500/20"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 mr-2" /> Start AI Auto-Review
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { name: "Biniyam Solomon", status: "submitted", date: "2h ago", id: "1" },
                                        { name: "Helena Tesfaye", status: "graded", date: "1d ago", score: "92", id: "2" },
                                        { name: "Dawit Isaac", status: "submitted", date: "5h ago", id: "3" },
                                    ].map((student) => (
                                        <div key={student.id} className="p-5 rounded-[32px] bg-muted border border-border flex items-center justify-between group hover:border-sky-500/50 transition-all cursor-pointer" onClick={() => student.status === 'submitted' && setViewingSubmission(student)}>
                                            <div className="flex items-center gap-5">
                                                <Avatar className="w-12 h-12 rounded-2xl border-2 border-border shadow-sm">
                                                    <AvatarFallback className="bg-sky-500/10 text-sky-500 font-bold text-sm">{student.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-black text-foreground group-hover:text-sky-500 transition-colors">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{student.status} • {student.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {student.status === "graded" ? (
                                                    <div className="px-5 py-2.5 rounded-2xl bg-sky-500/10 text-sky-500 font-black text-sm border border-sky-500/20 shadow-sm">
                                                        {student.score}
                                                    </div>
                                                ) : (
                                                    <Button size="sm" className="h-11 px-6 rounded-2xl bg-card border border-border text-sky-500 shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-sky-500/10">
                                                        Review Script
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-border flex items-center justify-between bg-muted/50">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {viewingSubmission ? "Press back to return to list" : "3 submissions remaining in queue"}
                        </p>
                        <Button onClick={() => { setIsGradingOpen(false); setViewingSubmission(null); }} className="h-11 px-6 rounded-xl bg-card border border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted">
                            Close Panel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
