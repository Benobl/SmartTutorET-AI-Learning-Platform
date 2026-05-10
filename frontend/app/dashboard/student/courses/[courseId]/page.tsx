"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    ArrowLeft, ArrowRight, PlayCircle, Clock, Users, Star, CheckCircle,
    BookOpen, Video, MonitorPlay, Calendar, Zap, Lock,
    ChevronRight, GraduationCap, Sparkles, BrainCircuit, FileDown,
    Youtube, Book, ExternalLink, Library, ArrowUpRight, Search,
    MessageSquare, FileText, Send, X, PenTool, ChevronDown, ChevronUp, FileUp
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { courseApi, paymentApi, aiApi, assignmentApi, assessmentApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AIQuiz } from "@/components/dashboard/courses/ai-quiz"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Message {
    role: "user" | "assistant"
    content: string
}

const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // Regular expression to extract YouTube ID from various formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`;
    }
    
    // Fallback if ID extraction fails but it's clearly a YT link
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return url; 
    }
    
    return url;
};

export default function CourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [activeLesson, setActiveLesson] = useState<any>(null)
    const [showQuiz, setShowQuiz] = useState(false)
    const [lessons, setLessons] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [assignments, setAssignments] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [aiMessages, setAiMessages] = useState<Message[]>([])
    const [aiInput, setAiInput] = useState("")
    const [isAiTyping, setIsAiTyping] = useState(false)
    const [activeTab, setActiveTab] = useState("lectures")
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
    const [submissionContent, setSubmissionContent] = useState("")
    const [submissionFile, setSubmissionFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const userStr = localStorage.getItem("smarttutor_user")
        if (userStr) setCurrentUser(JSON.parse(userStr))
    }, [])

    useEffect(() => {
        const loadCourse = async () => {
            setIsLoading(true)
            try {
                const res = await courseApi.getById(courseId)
                const data = res.data || res
                
                const isEnrolled = data.isEnrolled || data.students?.some((s: any) => 
                    (typeof s === 'string' && s === currentUser?._id) || 
                    (s._id && s._id === currentUser?._id)
                ) || false

                setCourse({
                    id: data._id || data.id,
                    name: data.title || data.name || "Untitled Course",
                    tutor: data.instructor?.name || data.tutor?.name || "Expert Tutor",
                    image: data.thumbnail || data.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
                    grade: data.gradeLevel || data.grade || "All Grades",
                    semester: data.semester || "Semester 1",
                    students: data.students?.length || 0,
                    description: data.description || "Master the fundamental concepts in this comprehensive course.",
                    progress: 0,
                    lessonsCount: data.lessons?.length || 0,
                    completed: 0,
                    priceValue: data.price || 0,
                    enrolled: isEnrolled
                })
                // Load unified content from MongoDB
                try {
                    const contentRes = await courseApi.getContent(courseId)
                    const unifiedContent = contentRes.data || []
                    
                    const mongoLessons = data.lessons || []
                    const lessonsMap = new Map()
                    
                    // Legacy lessons
                    mongoLessons.forEach((ml: any) => lessonsMap.set(ml.title, { ...ml, source: 'legacy' }))
                    
                    // Unified content
                    unifiedContent.forEach((c: any) => {
                        const type = c.category?.toLowerCase() || 'video'
                        lessonsMap.set(c.title, {
                            ...c,
                            _id: c._id,
                            type: type,
                            videoUrl: c.contentId?.url || c.contentId?.videoId || c.videoUrl || c.url,
                            pptUrl: c.contentId?.url || c.pptUrl || c.url,
                            exerciseUrl: c.contentId?.url || c.exerciseUrl || c.url,
                            quizData: c.contentId?.questions,
                            source: 'unified'
                        })
                    })
                    
                    setLessons(Array.from(lessonsMap.values()))
                } catch (contentErr) {
                    console.error("Failed to load unified content", contentErr)
                    setLessons(data.lessons || [])
                }
                
                // Load assignments & submissions
                const [assignRes, subRes] = await Promise.all([
                    assignmentApi.getByCourse(courseId),
                    assignmentApi.getMySubmissionsForCourse(courseId)
                ])
                setAssignments(assignRes.data || [])
                setSubmissions(subRes.data || [])
            } catch (error) {
                console.error("Failed to load course", error)
                toast({ title: "Error", description: "Failed to load course data.", variant: "destructive" })
            } finally {
                setIsLoading(false)
            }
        }
        if (courseId) loadCourse()
    }, [courseId])

    useEffect(() => {
        if (lessons.length > 0 && !activeLesson) {
            // Don't auto-set if we want user to click first, but for now we'll keep it
            setActiveLesson(lessons[0])
        }
    }, [lessons]) // Removed activeLesson from deps to prevent infinite loop or resets

    // Handle lesson selection with scroll
    const handleSelectLesson = (lesson: any) => {
        setActiveLesson(lesson)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleEnroll = async () => {
        if (!currentUser) return router.push("/auth/login")
        setEnrolling(true)
        try {
            await paymentApi.enrollFree(course.id)
            setCourse((prev: any) => ({ ...prev, enrolled: true }))
            toast({ title: "Enrolled Successfully!", description: "Welcome to the course community." })
        } catch (error: any) {
            toast({ title: "Enrollment Failed", description: error.message, variant: "destructive" })
        } finally {
            setEnrolling(false)
        }
    }

    const handleAskAi = async () => {
        if (!aiInput.trim() || isAiTyping) return
        const userMsg: Message = { role: "user", content: aiInput }
        setAiMessages(prev => [...prev, userMsg])
        setAiInput("")
        setIsAiTyping(true)

        try {
            const performanceData = { lesson: activeLesson?.title, course: course?.name }
            const res = await aiApi.askTutor(aiInput, performanceData)
            const assistantMsg: Message = { role: "assistant", content: res.data.response }
            setAiMessages(prev => [...prev, assistantMsg])
        } catch (error: any) {
            toast({ title: "AI Error", description: error.message, variant: "destructive" })
        } finally {
            setIsAiTyping(false)
        }
    }

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 p-8 space-y-8 max-w-7xl mx-auto">
            <Skeleton className="h-10 w-48 rounded-2xl" />
            <Skeleton className="h-[400px] w-full rounded-[40px]" />
            <div className="grid grid-cols-3 gap-8">
                <Skeleton className="h-64 col-span-2 rounded-[32px]" />
                <Skeleton className="h-64 rounded-[32px]" />
            </div>
        </div>
    )

    if (!course) return <div className="p-20 text-center font-black uppercase text-slate-400">Course Not Found</div>

    const lectures = lessons.filter(l => l.type === 'video' || l.type === 'youtube' || l.type === 'recording' || !l.type)
    const materials = lessons.filter(l => l.type === 'ppt' || l.type === 'pdf' || l.type === 'document')
    const practice = [...lessons.filter(l => l.type === 'quiz' || l.type === 'exercise' || l.type === 'exam'), ...assignments]

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            <div className="relative w-full h-[65vh] bg-white border-b border-slate-100 flex flex-col overflow-hidden">
                {!course.enrolled ? (
                    <div className="w-full h-full relative flex items-center justify-center text-center p-8">
                        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <Badge className="bg-sky-50 text-sky-600 border border-sky-100 px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase mb-10 shadow-sm">Grade {course.grade} • Academic Track</Badge>
                            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 italic uppercase tracking-tighter mb-10 leading-[0.9]">
                                {course.name.split(' ').map((word: string, i: number) => (
                                    <span key={i} className={i % 2 === 1 ? "text-sky-600" : ""}>{word} </span>
                                ))}
                            </h1>
                            <Button 
                                onClick={handleEnroll} 
                                disabled={enrolling}
                                className="h-20 px-16 rounded-[32px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-slate-200 hover:scale-105 transition-all active:scale-95 flex items-center gap-4 mx-auto"
                            >
                                {enrolling ? "Synchronizing..." : `Initialize Learning for ${course.priceValue} ETB`}
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-slate-950 flex flex-col relative no-copy">
                        {activeLesson ? (
                            <div className="flex-1 w-full relative">
                                { (activeLesson.type === "video" || activeLesson.type === "youtube") ? (
                                    <div className="w-full h-full aspect-video bg-black">
                                        {(activeLesson.videoUrl?.includes('youtube.com') || activeLesson.videoUrl?.includes('youtu.be') || activeLesson.type === "youtube") ? (
                                            <div className="w-full h-full flex flex-col">
                                                <div className="flex-1 relative">
                                                    <iframe 
                                                        src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                                                        className="w-full h-full border-none"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                                <div className="bg-slate-900 p-4 border-t border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Youtube className="w-5 h-5 text-rose-500" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube Content • {activeLesson.title}</p>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-10 px-6 rounded-xl bg-white/5 hover:bg-rose-500 hover:text-white text-white font-black text-[9px] uppercase tracking-widest transition-all"
                                                        onClick={() => window.open(activeLesson.videoUrl, '_blank')}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                                        Open on YouTube
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : activeLesson.videoUrl ? (
                                            <div className="w-full h-full flex flex-col">
                                                <div className="flex-1 bg-black">
                                                    <div className="relative w-full h-full">
                                                        <video 
                                                            src={activeLesson.videoUrl} 
                                                            controls 
                                                            controlsList="nodownload"
                                                            onContextMenu={(e) => e.preventDefault()}
                                                            className="w-full h-full object-contain shadow-2xl"
                                                            poster={activeLesson.thumbnail}
                                                        />
                                                        {/* Anti-Piracy Watermark */}
                                                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                                                            <div className="absolute animate-marquee whitespace-nowrap text-white text-[8px] font-black uppercase tracking-[0.5em] rotate-12">
                                                                {user?.email || "SECURE STREAM"} • {user?.email || "SECURE STREAM"} • {user?.email || "SECURE STREAM"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-900 p-4 border-t border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {activeLesson.source === 'recording' ? (
                                                            <MonitorPlay className="w-5 h-5 text-sky-500" />
                                                        ) : (
                                                            <Video className="w-5 h-5 text-indigo-500" />
                                                        )}
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {activeLesson.source === 'recording' ? "Live Session Recording" : "Internal Video Module"} • {activeLesson.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                                <Video className="w-16 h-16 opacity-20" />
                                                <p className="font-bold text-sm uppercase tracking-widest">Video Stream Unavailable</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (activeLesson.type === "ppt" || activeLesson.type === "document" || activeLesson.type === "pdf") ? (
                                    <div className="w-full h-full flex flex-col bg-slate-900">
                                        <div className="flex-1 relative bg-slate-800">
                                            <iframe 
                                                src={activeLesson.pptUrl || activeLesson.content_url || activeLesson.videoUrl}
                                                className="w-full h-full border-none"
                                                title={activeLesson.title}
                                            ></iframe>
                                        </div>
                                        <div className="p-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-amber-500" />
                                                <h3 className="text-sm font-black text-white uppercase italic">{activeLesson.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button 
                                                    variant="ghost"
                                                    className="h-10 px-6 rounded-xl bg-white/5 text-white hover:bg-amber-500 hover:text-black font-black uppercase text-[9px] tracking-widest transition-all"
                                                    onClick={() => window.open(activeLesson.pptUrl || activeLesson.content_url || activeLesson.videoUrl, '_blank')}
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-2" />
                                                    Full Screen
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    className="h-10 px-6 rounded-xl border-white/10 text-white hover:bg-white/5 font-black uppercase text-[9px] tracking-widest transition-all"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = activeLesson.pptUrl || activeLesson.content_url || activeLesson.videoUrl;
                                                        link.download = `${activeLesson.title}.pdf`;
                                                        link.click();
                                                    }}
                                                >
                                                    <FileDown className="w-3.5 h-3.5 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (activeLesson.type === "quiz" || activeLesson.type === "exercise" || activeLesson.type === "exam") ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-slate-900 overflow-y-auto">
                                        {!showQuiz ? (
                                            <div className="text-center">
                                                <div className="w-24 h-24 rounded-3xl bg-sky-500/10 flex items-center justify-center mb-8 border border-sky-500/20 mx-auto">
                                                    <BrainCircuit className="w-12 h-12 text-sky-500" />
                                                </div>
                                                <h3 className="text-2xl font-black text-white uppercase italic mb-4">{activeLesson.title}</h3>
                                                <p className="text-slate-400 font-bold text-center max-w-md mb-8">
                                                    {activeLesson.type === "exam" ? "OFFICIAL EVALUATION MODE: Secure environment enabled." : "PRACTICE MODE: Interactive quiz system initialized."}
                                                </p>
                                                <Button 
                                                    className="h-14 px-12 rounded-2xl bg-sky-500 hover:bg-sky-600 text-black font-black uppercase italic tracking-widest text-xs"
                                                    onClick={() => setShowQuiz(true)}
                                                >
                                                    <Activity className="w-4 h-4 mr-2" />
                                                    Start {activeLesson.type.toUpperCase()}
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-4xl h-full py-10">
                                                <AIQuiz 
                                                    lessonTitle={activeLesson.title}
                                                    type={activeLesson.type as any}
                                                    questions={activeLesson.quizData} // Pass tutor questions
                                                    onComplete={(score) => {
                                                        toast({ title: "Module Complete", description: `You achieved a score of ${score}%` })
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                        <Sparkles className="w-16 h-16 opacity-20" />
                                        <p className="font-bold text-sm uppercase tracking-widest">Interactive Component Ready</p>
                                    </div>
                                )}
                                
                                <Button 
                                    onClick={() => setActiveLesson(null)}
                                    className="absolute top-10 left-10 h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-2xl font-black uppercase text-[10px] tracking-[0.2em] z-50 transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-3" /> Minimize View
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-20 bg-slate-950">
                                <Sparkles className="w-20 h-20 mb-8 text-sky-400 opacity-20 animate-pulse" />
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Module Player</h2>
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Select a lesson from the curriculum below to begin</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modern Content Architecture ── */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-20">
                <Tabs defaultValue="lectures" className="w-full" onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                        <TabsList className="h-20 bg-white p-2 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 flex items-stretch min-w-[600px]">
                            <TabsTrigger value="lectures" className="flex-1 rounded-[24px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all duration-500 relative">
                                <Video className="w-4 h-4 mr-3" /> Lectures
                                {lectures.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[8px] flex items-center justify-center border-2 border-white">{lectures.length}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="materials" className="flex-1 rounded-[24px] data-[state=active]:bg-amber-500 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all duration-500 relative">
                                <Book className="w-4 h-4 mr-3" /> Resources
                                {materials.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full text-[8px] flex items-center justify-center border-2 border-white">{materials.length}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="practice" className="flex-1 rounded-[24px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all duration-500 relative">
                                <Zap className="w-4 h-4 mr-3" /> Practice
                                {practice.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full text-[8px] flex items-center justify-center border-2 border-white">{practice.length}</span>}
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="flex-1 rounded-[24px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all duration-500">
                                <BrainCircuit className="w-4 h-4 mr-3" /> Smart Tutor
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[28px] border border-slate-100 shadow-sm">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Your Progress</p>
                                <p className="text-xl font-black text-slate-900 italic leading-none">{course.progress}%</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <CheckCircle className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>


                    <div className="mt-12">
                        {/* ── Lectures Tab ── */}
                        <TabsContent value="lectures" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lectures.map((l, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => handleSelectLesson(l)} 
                                        className={cn(
                                            "group p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-hidden",
                                            activeLesson?._id === l._id || activeLesson?.title === l.title 
                                                ? "bg-indigo-50 border-indigo-200 shadow-xl" 
                                                : "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-2xl"
                                        )}
                                    >
                                        {activeLesson?._id === l._id && (
                                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                        )}
                                        <div className="aspect-video rounded-2xl bg-slate-50 mb-6 overflow-hidden relative border border-slate-100">
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors">
                                                <PlayCircle className="w-10 h-10 text-indigo-600 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" />
                                            </div>
                                        </div>
                                        <h4 className="font-black text-slate-900 uppercase italic text-sm mb-2 truncate">{l.title}</h4>
                                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 15:00</span>
                                            <span className="text-indigo-600">Video Lesson</span>
                                        </div>
                                    </div>
                                ))}
                                {lectures.length === 0 && <div className="col-span-full py-20 text-center font-black uppercase text-slate-400 italic">No video lectures uploaded yet.</div>}
                            </div>
                        </TabsContent>

                        {/* ── Materials Tab ── */}
                        <TabsContent value="materials" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {materials.map((l, i) => (
                                    <div key={i} onClick={() => setActiveLesson(l)} className="group p-8 rounded-[40px] bg-white border border-slate-100 hover:border-amber-100 hover:shadow-2xl transition-all cursor-pointer flex items-center gap-8">
                                        <div className="w-20 h-20 rounded-[32px] bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0 group-hover:scale-110 transition-transform">
                                            <FileDown className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase italic text-lg mb-2">{l.title}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{l.type?.toUpperCase() || "DOCUMENTATION"}</p>
                                        </div>
                                    </div>
                                ))}
                                {materials.length === 0 && <div className="col-span-full py-20 text-center font-black uppercase text-slate-400 italic">No study materials found.</div>}
                            </div>
                        </TabsContent>

                        {/* ── Practice Tab ── */}
                        <TabsContent value="practice" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                            {/* Assignments Section */}
                            {assignments.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 ml-2">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Assignments</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {assignments.map((assignment) => {
                                            const submission = submissions.find(s => s.assignment === assignment._id);
                                            const dueDate = new Date(assignment.dueDate);
                                            const isOverdue = dueDate < new Date() && !submission;
                                            const isUrgent = !submission && !isOverdue && (dueDate.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000;
                                            
                                            return (
                                                <div key={assignment._id} className={cn(
                                                    "p-8 rounded-[40px] bg-white border shadow-xl transition-all flex flex-col justify-between",
                                                    isUrgent ? "border-rose-200 bg-rose-50/10 shadow-rose-500/5" : "border-slate-100 shadow-slate-200/10 hover:border-indigo-100"
                                                )}>
                                                    <div className="space-y-6">
                                                        <div className="flex items-start justify-between">
                                                            <div className={cn(
                                                                "w-14 h-14 rounded-2xl flex items-center justify-center border",
                                                                isUrgent ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                            )}>
                                                                <FileText className="w-7 h-7" />
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <Badge className={cn(
                                                                    "border-none text-[8px] font-black uppercase italic",
                                                                    submission?.status === "evaluated" ? "bg-emerald-50 text-emerald-600" : 
                                                                    submission ? "bg-amber-50 text-amber-600" :
                                                                    isOverdue ? "bg-rose-50 text-rose-600" : 
                                                                    isUrgent ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "bg-slate-50 text-slate-400"
                                                                )}>
                                                                    {submission?.status === "evaluated" ? "Graded" : 
                                                                     submission ? "Submitted" : 
                                                                     isOverdue ? "Overdue" : 
                                                                     isUrgent ? "Urgent: < 24h" : "Pending"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 uppercase italic">{assignment.title}</h4>
                                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <span className="flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> {assignment.weight}% Weight</span>
                                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-rose-500" /> {format(new Date(assignment.dueDate), "MMM dd")}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 mt-8 border-t border-slate-50">
                                                        {submission?.status === "evaluated" ? (
                                                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Result: {submission.marksObtained} / {assignment.maxMarks}</p>
                                                                {submission.feedback && <p className="text-[9px] text-emerald-700/70 font-medium italic line-clamp-2">"{submission.feedback}"</p>}
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setIsSubmitModalOpen(true);
                                                                }}
                                                                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[9px] tracking-widest shadow-xl shadow-slate-200"
                                                            >
                                                                {submission ? "Update Submission" : "Submit Work"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quizzes & Exams Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 ml-2">
                                    <Zap className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Interactive Assessments</h3>
                                </div>
                                <div className="space-y-6">
                                    {practice.map((l, i) => (
                                <div key={i} className={cn(
                                    "group p-8 rounded-[48px] bg-white border transition-all flex flex-col md:flex-row md:items-center justify-between gap-8",
                                    l.type === 'exam' ? "border-amber-100 hover:border-amber-300 hover:shadow-amber-500/10" : "border-slate-100 hover:border-emerald-100 hover:shadow-2xl"
                                )}>
                                    <div className="flex items-center gap-8">
                                        <div className={cn(
                                            "w-20 h-20 rounded-[32px] flex items-center justify-center border shrink-0 transition-all",
                                            l.type === 'exam' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                                        )}>
                                            {l.type === 'exam' ? (
                                                <GraduationCap className="w-10 h-10 text-amber-600" />
                                            ) : (
                                                <Zap className="w-10 h-10 text-emerald-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-black text-slate-900 uppercase italic text-xl">{l.title}</h4>
                                                {l.type === 'exam' && (
                                                    <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[8px] uppercase tracking-tighter">High Stakes</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className={cn(
                                                    "border-none font-black text-[9px] uppercase",
                                                    l.type === 'exam' ? "bg-amber-50 text-amber-600" : "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {l.type === 'exam' ? "Final Evaluation" : "10 Questions"}
                                                </Badge>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Activity</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => { setActiveLesson(l); setShowQuiz(true); }}
                                        className={cn(
                                            "h-16 px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95",
                                            l.type === 'exam' ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                                        )}
                                    >
                                        {l.type === 'exam' ? "Take Official Exam" : "Start Assessment"}
                                    </Button>
                                </div>
                            ))}
                                </div>
                            </div>
                            {practice.length === 0 && <div className="py-20 text-center font-black uppercase text-slate-400 italic">No practice modules or exams assigned.</div>}
                        </TabsContent>

                        {/* ── Smart Tutor Tab ── */}
                        <TabsContent value="ai" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                                <div className="w-full md:w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="w-16 h-16 rounded-[28px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                            <BrainCircuit className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">Academic <span className="text-indigo-400">Tutor</span></h3>
                                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                            Ask Gemini anything about your course. It's trained on your specific grade and curriculum.
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Live Context</p>
                                        <p className="text-xs font-bold">{activeLesson?.title || course.name}</p>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col bg-slate-50 p-12">
                                    <ScrollArea className="flex-1 pr-6">
                                        <div className="space-y-8">
                                            {aiMessages.length === 0 ? (
                                                <div className="py-20 text-center space-y-6 opacity-30">
                                                    <Sparkles className="w-16 h-16 mx-auto text-indigo-500" />
                                                    <p className="font-black uppercase text-sm tracking-[0.3em]">How can I guide your learning?</p>
                                                </div>
                                            ) : aiMessages.map((msg, i) => (
                                                <div key={i} className={cn("flex flex-col gap-3", msg.role === 'user' ? "items-end" : "items-start")}>
                                                    <div className={cn("p-6 rounded-[32px] text-sm font-medium leading-relaxed max-w-[85%] shadow-xl", 
                                                        msg.role === 'user' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none")}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase px-4">{msg.role === 'user' ? 'You' : 'Smart Tutor'}</span>
                                                </div>
                                            ))}
                                            {isAiTyping && (
                                                <div className="flex items-start gap-4 animate-pulse">
                                                    <div className="bg-white p-6 rounded-[32px] rounded-tl-none shadow-sm">
                                                        <div className="flex gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                                                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                                                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <div className="mt-10 relative group">
                                        <Input 
                                            value={aiInput}
                                            onChange={e => setAiInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAskAi()}
                                            placeholder="Type your academic question here..."
                                            className="h-16 pl-8 pr-20 rounded-3xl bg-white border-slate-200 font-bold text-sm shadow-xl focus:ring-4 focus:ring-indigo-100 transition-all"
                                        />
                                        <Button 
                                            onClick={handleAskAi}
                                            disabled={!aiInput.trim() || isAiTyping}
                                            className="absolute right-3 top-3 h-10 w-10 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white shadow-xl transition-all active:scale-90"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Quiz Overlay */}
            {showQuiz && activeLesson && (
                <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[300] p-8 lg:p-20 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Assessment <span className="text-emerald-400">Mode</span></h2>
                            <Button variant="ghost" onClick={() => setShowQuiz(false)} className="rounded-2xl text-white hover:bg-white/10">
                                <X className="w-8 h-8 mr-3" /> <span className="font-black uppercase text-xs">Exit</span>
                            </Button>
                        </div>
                        <div className="bg-white rounded-[56px] p-2 shadow-2xl overflow-hidden">
                            <AIQuiz 
                                courseId={courseId} 
                                lessonId={activeLesson._id || activeLesson.id} 
                                onComplete={() => { setShowQuiz(false); toast({ title: "Lesson Completed!", className: "bg-emerald-500 text-white" }) }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Global AI Floating Toggle (For when not in AI tab) */}
            {activeTab !== "ai" && (
                <div className="fixed bottom-12 right-12 z-[200]">
                    <Button 
                        onClick={() => setActiveTab("ai")}
                        className="w-20 h-20 rounded-[32px] bg-slate-900 hover:bg-indigo-600 text-white shadow-2xl transition-all duration-500 hover:scale-110 group relative"
                    >
                        <BrainCircuit className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-50 flex items-center justify-center animate-bounce">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                    </Button>
                </div>
            )}
            {/* Submission Modal */}
            <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
                <DialogContent className="sm:max-w-[550px] rounded-[48px] border-none p-10 shadow-2xl">
                    <DialogHeader>
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                            <Send className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Submit <span className="text-indigo-600">Work</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Upload your completed assignment for "{selectedAssignment?.title}". Ensure all files meet the requirements.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Submission Notes</label>
                            <Textarea 
                                placeholder="Add any comments for your teacher..."
                                className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 font-medium text-sm p-4"
                                value={submissionContent}
                                onChange={(e) => setSubmissionContent(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Attach Files</label>
                            <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50/50">
                                <input 
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                />
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <FileUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">
                                            {submissionFile ? submissionFile.name : "Choose File"}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, Docs, or Images (Max 10MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            disabled={isSubmitting}
                            onClick={async () => {
                                if (!submissionFile && !submissionContent) return;
                                try {
                                    setIsSubmitting(true);
                                    let fileUrl = "";
                                    if (submissionFile) {
                                        const { uploadToSupabase } = await import("@/lib/supabase");
                                        fileUrl = await uploadToSupabase(submissionFile, 'submissions');
                                    }
                                    await assignmentApi.submit(selectedAssignment._id, {
                                        content: submissionContent,
                                        attachments: fileUrl ? [fileUrl] : []
                                    });
                                    toast({ title: "Success", description: "Assignment submitted successfully!" });
                                    setIsSubmitModalOpen(false);
                                    setSubmissionContent("");
                                    setSubmissionFile(null);
                                    // Refresh data
                                    const subRes = await assignmentApi.getMySubmissionsForCourse(courseId);
                                    setSubmissions(subRes.data || []);
                                } catch (error: any) {
                                    toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className="w-full h-16 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/30"
                        >
                            {isSubmitting ? "Uploading..." : "Confirm Submission"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
