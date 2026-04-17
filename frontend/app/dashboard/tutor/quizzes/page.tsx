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

const MOCK_QUIZZES = [
    { id: "q1", title: "Intro to Particles", type: "AI-Generated", course: "Physics G12", questions: 10, completed: 42, avgScore: "84%", status: "active" },
    { id: "q2", title: "Mid-Term Mock Test", type: "Teacher-Made", course: "Math G11", questions: 30, completed: 52, avgScore: "72%", status: "active" },
    { id: "q3", title: "Biology Unit 1 Quiz", type: "Teacher-Made", course: "Biology G10", questions: 15, completed: 38, avgScore: "91%", status: "completed" },
]

export default function TeacherQuizzes() {
    const { toast } = useToast()
    const [isGenerating, setIsGenerating] = useState(false)
    const [isManualCreating, setIsManualCreating] = useState(false)
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
    const [prompt, setPrompt] = useState("")
    const [selectedCourse, setSelectedCourse] = useState("Physics G12")

    const handleGenerate = () => {
        if (!prompt) {
            toast({
                title: "Prompt Required",
                description: "Please describe the topic for AI generation.",
                variant: "destructive"
            })
            return
        }
        setIsGenerating(true)
        setTimeout(() => {
            setIsGenerating(false)
            toast({
                title: "Quiz Generated Successfully",
                description: "15 questions have been added to your draft library.",
            })
        }, 2000)
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border">Assessment Suite</span>
                            <Brain className="w-4 h-4 text-sky-500 fill-sky-500/50" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-none mb-3 uppercase">
                            Quiz & <span className='text-sky-600'>Test Hub</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium max-w-md">
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
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-border bg-card text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-sky-500 hover:bg-sky-500/10 transition-all">
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
            <div className="p-10 lg:p-16 rounded-[64px] bg-card border border-border shadow-2xl shadow-black/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/5 blur-3xl rounded-full -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-[3000ms]" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-widest mb-6 border border-sky-500/20">AI-Powered Question Engine</div>
                            <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-none tracking-tight uppercase italic">Instant <span className="text-sky-600">Quiz</span> Generator</h2>
                        </div>
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                            Describe your topic or paste lesson content. Our AI will automatically generate multiple-choice, short-answer, and essay questions tailored for your grade level.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger className="h-12 w-48 rounded-xl bg-muted border-border text-foreground font-black text-[10px] uppercase tracking-widest outline-none focus:ring-sky-500/20">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border bg-card">
                                        <SelectItem value="Physics G12">Physics G12</SelectItem>
                                        <SelectItem value="Math G11">Math G11</SelectItem>
                                        <SelectItem value="Biology G10">Biology G10</SelectItem>
                                        <SelectItem value="Chemistry G12">Chemistry G12</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-[10px] font-black uppercase text-sky-400">Targeting {selectedCourse}</span>
                            </div>
                            <textarea
                                placeholder="Topic: Ethiopian History - The Battle of Adwa... (Or Grade 12 Physics: Magnetism)"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-32 rounded-[28px] bg-muted border border-border p-6 text-foreground placeholder:text-muted-foreground/30 font-medium outline-none focus:bg-card focus:ring-4 focus:ring-sky-500/5 transition-all shadow-inner"
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
                                <Button variant="outline" className="h-16 px-10 rounded-2xl border-border bg-card text-muted-foreground font-black text-xs uppercase tracking-widest hover:text-sky-500 transition-all">
                                    Advanced Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full max-w-sm aspect-[4/5] rounded-[64px] bg-card border border-border shadow-2xl p-10 relative overflow-hidden flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Live Preview</span>
                                <Sparkles className="w-5 h-5 text-sky-500 group-hover:animate-pulse" />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="h-2 w-3/4 bg-muted rounded-full" />
                                    <div className="h-2 w-full bg-muted rounded-full" />
                                </div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-4 rounded-2xl border border-border bg-muted/50 flex items-center justify-between">
                                        <div className="h-2 w-1/2 bg-muted-foreground/20 rounded-full" />
                                        <div className="w-4 h-4 rounded-full border border-border" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Adaptive Difficulty</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={cn("w-1.5 h-4 rounded-full", i <= 3 ? "bg-sky-500" : "bg-muted")} />
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
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Previous Assessments</h3>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="rounded-xl border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {MOCK_QUIZZES.map(quiz => (
                        <div key={quiz.id} className="group p-8 rounded-[48px] bg-card border border-border hover:border-sky-500/20 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <span className={cn(
                                    "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                                    quiz.status === 'active' ? "bg-sky-500/10 text-sky-500 border-sky-500/20" : "bg-muted text-muted-foreground border-border"
                                )}>
                                    {quiz.status}
                                </span>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                        <ListChecks className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-foreground leading-tight uppercase italic group-hover:text-sky-600 transition-colors">{quiz.title}</h4>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{quiz.course} • {quiz.questions} Qs</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[24px] bg-muted border border-border">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Completed</span>
                                        </div>
                                        <p className="text-sm font-black text-foreground">{quiz.completed} Students</p>
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-muted border border-border">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Avg Result</span>
                                        </div>
                                        <p className="text-sm font-black text-foreground">{quiz.avgScore}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex items-center justify-between">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">{quiz.type}</span>
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
                    <button className="h-full min-h-[300px] border-2 border-dashed border-border rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:bg-card hover:border-sky-500/20 hover:shadow-xl transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-sky-500/10 group-hover:text-sky-500 transition-all">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-sky-500 transition-all">New Assessment</p>
                    </button>
                </div>
            </div>

            {/* Manual Creation Dialog */}
            <Dialog open={isManualCreating} onOpenChange={setIsManualCreating}>
                <DialogContent className="sm:max-w-[600px] rounded-[48px] border-border p-10 bg-card shadow-3xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-widest border border-sky-500/20">Manual Entry</span>
                            <PenTool className="w-4 h-4 text-sky-500" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-foreground uppercase italic">Create <span className="text-sky-600">Static Test</span></DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">Design your own curriculum-specific questions and upload them to the library.</DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quiz Title</Label>
                            <Input placeholder="e.g. Unit 3: Thermodynamics Final" className="h-14 rounded-2xl bg-muted border-border font-bold text-foreground" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration (Min)</Label>
                                <Input type="number" placeholder="45" className="h-14 rounded-2xl bg-muted border-border font-bold text-foreground" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Points</Label>
                                <Input type="number" placeholder="100" className="h-14 rounded-2xl bg-muted border-border font-bold text-foreground" />
                            </div>
                        </div>
                        <div className="p-8 rounded-[32px] border-2 border-dashed border-border bg-muted text-center space-y-3 group cursor-pointer hover:bg-sky-500/5 hover:border-sky-500/20 transition-all relative">
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
                            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Upload Question Sheet or PDF</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Accepts .PDF, .CSV, .XLSX or .JSON</p>
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
                <DialogContent className="sm:max-w-[700px] rounded-[48px] border-border p-0 overflow-hidden bg-card shadow-3xl">
                    <div className="p-10 bg-muted border-b border-border">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">Performance Intelligence</span>
                                <BarChart3 className="w-4 h-4 text-amber-500" />
                            </div>
                            <DialogTitle className="text-3xl font-black text-foreground uppercase italic leading-none">Assessment <span className="text-sky-600">Analytics</span></DialogTitle>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-2">{selectedQuiz?.title} • {selectedQuiz?.course}</p>
                        </DialogHeader>
                    </div>

                    <div className="p-10 space-y-10">
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: "Pass Rate", value: "88%", icon: CheckCircle2, color: "text-emerald-500" },
                                { label: "High Score", value: "98/100", icon: Trophy, color: "text-amber-500" },
                                { label: "Time Taken", value: "18m", icon: Clock, color: "text-sky-500" }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 rounded-[32px] bg-card border border-border shadow-sm text-center space-y-2">
                                    <stat.icon className={cn("w-6 h-6 mx-auto", stat.color)} />
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <h4 className="text-xl font-black text-foreground">{stat.value}</h4>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Question Difficulty Distribution</h5>
                            <div className="space-y-4">
                                {[
                                    { level: "Easy", count: 12, width: "w-[85%]", color: "bg-emerald-500" },
                                    { level: "Medium", count: 18, width: "w-[60%]", color: "bg-sky-500" },
                                    { level: "Hard", count: 5, width: "w-[25%]", color: "bg-rose-500" }
                                ].map((row, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                            <span>{row.level} Questions</span>
                                            <span>{row.count} Students struggle</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", row.color, row.width)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-muted border-t border-border flex gap-4">
                        <Button className="flex-1 h-16 rounded-[24px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px]">Export full report</Button>
                        <Button
                            onClick={() => setIsAnalysisOpen(false)}
                            variant="outline"
                            className="h-16 px-8 rounded-[24px] border-border bg-card text-muted-foreground font-black uppercase tracking-widest text-[10px]"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
