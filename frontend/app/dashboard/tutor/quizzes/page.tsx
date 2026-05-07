"use client"

import { useState } from "react"
import {
    Brain, Plus, Search, Sparkles, LayoutGrid,
    CheckCircle2, AlertCircle, Clock, Timer,
    GraduationCap, BookOpen, Users, BarChart3,
    ArrowUpRight, ChevronRight, ListChecks,
    History, PenTool, Activity, Send, Filter, Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assessmentApi, courseApi } from "@/lib/api"
import { useEffect } from "react"

const MOCK_QUIZZES = [
    { id: "q1", title: "Intro to Particles", type: "AI-Generated", course: "Physics G12", questions: 10, completed: 42, avgScore: "84%", status: "active" },
    { id: "q2", title: "Mid-Term Mock Test", type: "Teacher-Made", course: "Math G11", questions: 30, completed: 52, avgScore: "72%", status: "active" },
    { id: "q3", title: "Biology Unit 1 Quiz", type: "Teacher-Made", course: "Biology G10", questions: 15, completed: 38, avgScore: "91%", status: "completed" },
]

export default function TeacherQuizzes() {
    const { toast } = useToast()
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGrade, setSelectedGrade] = useState("9")
    const [selectedStream, setSelectedStream] = useState("Common")
    const [count, setCount] = useState("5")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isManualCreating, setIsManualCreating] = useState(false)
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
    const [prompt, setPrompt] = useState("")
    const [selectedCourse, setSelectedCourse] = useState("General")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [qRes, cRes] = await Promise.all([
                assessmentApi.getAll(),
                courseApi.getMyCourses()
            ])
            setQuizzes(qRes.data || [])
            setCourses(cRes.data || [])
        } catch (error: any) {
            toast({ title: "Failed to load data", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!prompt) {
            toast({
                title: "Topic Required",
                description: "Please describe the topic for AI generation.",
                variant: "destructive"
            })
            return
        }
        setIsGenerating(true)
        try {
            const course = courses.find(c => c.title === selectedCourse);
            await assessmentApi.generateAI({
                subject: selectedCourse,
                grade: selectedGrade,
                stream: selectedStream,
                topic: prompt,
                count: parseInt(count),
                subjectId: course?._id
            })
            toast({
                title: "Quiz Generated Successfully",
                description: `A new quiz has been created and published for Grade ${selectedGrade} students.`,
            })
            setPrompt("")
            loadData()
        } catch (error: any) {
            toast({ title: "Generation failed", description: error.message, variant: "destructive" })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Assessment Suite</span>
                            <Brain className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Quiz & <span className='text-sky-600'>Test Hub</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Create adaptive AI assessments or design custom curriculum-based tests for your students across Grades 9-12.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsManualCreating(true)}
                            className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4 text-white" /> Create Static Test
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50 transition-all">
                            <History className="w-4 h-4 mr-2" /> Recent Drafts
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <Timer className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Avg Completion</p>
                            <h2 className="text-2xl font-black text-slate-900">22m</h2>
                        </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 flex items-center gap-6 min-w-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Attempts Today</p>
                            <h2 className="text-2xl font-black text-slate-900">142</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Generator Panel */}
            <div className="p-10 lg:p-16 rounded-[64px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/5 blur-3xl rounded-full -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-[3000ms]" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-sky-100">AI-Powered Question Engine</div>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-none tracking-tight uppercase italic">Instant <span className="text-sky-600">Quiz</span> Generator</h2>
                        </div>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Describe your topic or paste lesson content. Our AI will automatically generate multiple-choice, short-answer, and essay questions tailored for your grade level.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Target Grade</Label>
                                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                                    <SelectTrigger className="h-12 w-full rounded-xl bg-slate-50 border-slate-100 text-slate-900 font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-sky-500/20">
                                        <SelectValue placeholder="Grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["9", "10", "11", "12", "General"].map(g => (
                                            <SelectItem key={g} value={g}>{g === "General" ? "General" : `Grade ${g}`}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {["11", "12"].includes(selectedGrade) && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Stream</Label>
                                    <Select value={selectedStream} onValueChange={setSelectedStream}>
                                        <SelectTrigger className="h-12 w-full rounded-xl bg-slate-50 border-slate-100 text-slate-900 font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-sky-500/20">
                                            <SelectValue placeholder="Stream" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Natural Science", "Social Science", "Common"].map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Subject/Course</Label>
                                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger className="h-12 w-full rounded-xl bg-slate-50 border-slate-100 text-slate-900 font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-sky-500/20">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c._id} value={c.title}>{c.title}</SelectItem>
                                        ))}
                                        <SelectItem value="General">General/Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Question Count</Label>
                                <Select value={count} onValueChange={setCount}>
                                    <SelectTrigger className="h-12 w-full rounded-xl bg-slate-50 border-slate-100 text-slate-900 font-bold text-[10px] uppercase tracking-widest outline-none focus:ring-sky-500/20">
                                        <SelectValue placeholder="Count" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["5", "10", "15", "20"].map(c => (
                                            <SelectItem key={c} value={c}>{c} Questions</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                            <textarea
                                placeholder="Topic: Ethiopian History - The Battle of Adwa... (Or Grade 12 Physics: Magnetism)"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-32 rounded-[28px] bg-slate-50 border border-slate-100 p-6 text-slate-900 placeholder:text-slate-300 font-medium outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all shadow-inner"
                            />
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="h-16 px-10 rounded-2xl bg-sky-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-sky-500/20 hover:scale-105 transition-all"
                                >
                                    {isGenerating ? "Analyzing Topic..." : "Generate 15 Questions"}
                                    {!isGenerating && <Sparkles className="ml-3 w-4 h-4" />}
                                </Button>
                                <Button variant="outline" className="h-16 px-10 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-xs uppercase tracking-widest hover:text-sky-600 transition-all">
                                    Advanced Settings
                                </Button>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full max-w-sm aspect-[4/5] rounded-[64px] bg-white shadow-2xl p-10 relative overflow-hidden flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Live Preview</span>
                                <Sparkles className="w-5 h-5 text-sky-400 group-hover:animate-pulse" />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                                </div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="h-2 w-1/2 bg-slate-200 rounded-full" />
                                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Adaptive Difficulty</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={cn("w-1.5 h-4 rounded-full", i <= 3 ? "bg-sky-500" : "bg-slate-100")} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing Quizzes Table */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Previous Assessments</h3>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-[300px] rounded-[48px] bg-slate-50 animate-pulse" />
                        ))
                    ) : quizzes.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-slate-400 font-bold uppercase tracking-widest">
                            No assessments created yet.
                        </div>
                    ) : quizzes.map(quiz => (
                        <div key={quiz._id} className="group p-8 rounded-[48px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 flex flex-col gap-2 items-end">
                                <span className={cn(
                                    "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                                    quiz.isPublished ? "bg-sky-50 text-sky-500 border-sky-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                )}>
                                    {quiz.isPublished ? "Published" : "Draft"}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest">
                                    G{quiz.grade} {quiz.stream !== 'Common' && quiz.stream}
                                </span>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                        <ListChecks className="w-7 h-7" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-black text-slate-900 leading-tight uppercase italic group-hover:text-sky-600 transition-colors truncate">{quiz.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{quiz.subject?.title || "General"} • {quiz.questions?.length} Qs</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attempts</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{quiz.attemptsCount || 0}</p>
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Result</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{quiz.avgScore || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{quiz.creationMethod || 'manual'}</span>
                                    <Button
                                        onClick={() => {
                                            setSelectedQuiz(quiz)
                                            setIsPreviewOpen(true)
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="h-10 px-4 rounded-xl border-slate-200 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-sky-600 transition-all"
                                    >
                                        View Qs
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setSelectedQuiz(quiz)
                                            setIsAnalysisOpen(true)
                                        }}
                                        size="sm"
                                        className="h-10 px-6 rounded-xl bg-sky-600 text-white font-black text-[9px] uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-500/20"
                                    >
                                        Analyze Data
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-sky-100 hover:shadow-xl transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-500 transition-all">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-600 transition-all">New Assessment</p>
                    </button>
                </div>
            </div>

            {/* Manual Creation Dialog */}
            <Dialog open={isManualCreating} onOpenChange={setIsManualCreating}>
                <DialogContent className="sm:max-w-[600px] rounded-[48px] border-slate-100 p-10 bg-white shadow-3xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Manual Entry</span>
                            <PenTool className="w-4 h-4 text-sky-400" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Create <span className="text-sky-600">Static Test</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">Design your own curriculum-specific questions and upload them to the library.</DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quiz Title</Label>
                            <Input placeholder="e.g. Unit 3: Thermodynamics Final" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration (Min)</Label>
                                <Input type="number" placeholder="45" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Points</Label>
                                <Input type="number" placeholder="100" className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                            </div>
                        </div>
                        <div className="p-8 rounded-[32px] border-2 border-dashed border-slate-100 bg-slate-50 text-center space-y-3 group cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all relative">
                            <input
                                type="file"
                                accept=".pdf,.csv,.xlsx,.json"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        toast({
                                            title: "File Uploading",
                                            description: `Parsing ${file.name} for questions...`,
                                        })
                                    }
                                }}
                            />
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6 text-sky-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Upload Question Sheet or PDF</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accepts .PDF, .CSV, .XLSX or .JSON</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                setIsManualCreating(false)
                                toast({ title: "Quiz Framework Created", description: "You can now start adding questions to the editor." })
                            }}
                            className="w-full h-16 rounded-[24px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-sky-500/20 transition-all"
                        >
                            Initialize Quiz <ArrowUpRight className="ml-2 w-5 h-5" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Analysis Dialog */}
            <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[48px] border-slate-100 p-0 overflow-hidden bg-white shadow-3xl">
                    <div className="p-10 bg-slate-50 border-b border-slate-100">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-100">Performance Intelligence</span>
                                <BarChart3 className="w-4 h-4 text-amber-500" />
                            </div>
                            <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic leading-none">Assessment <span className="text-sky-600">Analytics</span></DialogTitle>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">{selectedQuiz?.title} • {selectedQuiz?.course}</p>
                        </DialogHeader>
                    </div>

                    <div className="p-10 space-y-10">
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: "Pass Rate", value: "88%", icon: CheckCircle2, color: "text-emerald-500" },
                                { label: "High Score", value: "98/100", icon: Trophy, color: "text-amber-500" },
                                { label: "Time Taken", value: "18m", icon: Clock, color: "text-sky-500" }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm text-center space-y-2">
                                    <stat.icon className={cn("w-6 h-6 mx-auto", stat.color)} />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <h4 className="text-xl font-black text-slate-900">{stat.value}</h4>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Difficulty Distribution</h5>
                            <div className="space-y-4">
                                {[
                                    { level: "Easy", count: 12, width: "w-[85%]", color: "bg-emerald-500" },
                                    { level: "Medium", count: 18, width: "w-[60%]", color: "bg-sky-500" },
                                    { level: "Hard", count: 5, width: "w-[25%]", color: "bg-rose-500" }
                                ].map((row, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <span>{row.level} Questions</span>
                                            <span>{row.count} Students struggle</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", row.color, row.width)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                        <Button className="flex-1 h-16 rounded-[24px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px]">Export full report</Button>
                        <Button
                            onClick={() => setIsAnalysisOpen(false)}
                            variant="outline"
                            className="h-16 px-8 rounded-[24px] border-slate-200 bg-white text-slate-400 font-black uppercase tracking-widest text-[10px]"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Preview Questions Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-[800px] rounded-[48px] border-slate-100 p-10 bg-white shadow-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Question Preview</span>
                            <Sparkles className="w-4 h-4 text-sky-400" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">
                            {selectedQuiz?.title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Reviewing {selectedQuiz?.questions?.length} questions generated for this assessment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-8">
                        {selectedQuiz?.questions?.map((q: any, i: number) => (
                            <div key={i} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <h4 className="text-lg font-bold text-slate-900">
                                        <span className="text-sky-600 mr-2">Q{i + 1}.</span> {q.question}
                                    </h4>
                                    <span className="px-3 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {q.marks || 1} pt
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((opt: string, j: number) => (
                                        <div 
                                            key={j} 
                                            className={cn(
                                                "p-4 rounded-xl border text-sm font-medium transition-all",
                                                opt === q.correctAnswer 
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" 
                                                    : "bg-white border-slate-100 text-slate-600"
                                            )}
                                        >
                                            <span className="mr-3 text-[10px] font-black text-slate-300">
                                                {String.fromCharCode(65 + j)}
                                            </span>
                                            {opt}
                                            {opt === q.correctAnswer && (
                                                <CheckCircle2 className="w-4 h-4 inline-block ml-2 text-emerald-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button 
                            onClick={() => setIsPreviewOpen(false)}
                            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-sky-600 transition-all"
                        >
                            Close Preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
