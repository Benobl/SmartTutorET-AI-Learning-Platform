"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    ArrowLeft, ArrowRight, PlayCircle, Clock, Users, Star, CheckCircle,
    BookOpen, Video, MonitorPlay, Calendar, Zap, Lock,
    ChevronRight, GraduationCap, Sparkles, BrainCircuit, FileDown,
    Youtube, Book, ExternalLink, Library, ArrowUpRight, Search,
    MessageSquare, FileText, Send, X, PenTool, ChevronDown, ChevronUp
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

interface Message {
    role: "user" | "assistant"
    content: string
}

const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("embed/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/shorts/")) {
        videoId = url.split("shorts/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
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
                    enrolled: data.isEnrolled || false
                })
                const { supabase } = await import("@/lib/supabase")
                if (supabase) {
                    const { data: sbLessons, error: sbError } = await supabase
                        .from('course_contents')
                        .select('*')
                        .eq('course_id', courseId)
                    
                    if (!sbError && sbLessons && sbLessons.length > 0) {
                        // Merge lessons: prioritize Supabase content if title matches
                        const mongoLessons = data.lessons || [];
                        const lessonsMap = new Map();
                        
                        // First add all mongo lessons
                        mongoLessons.forEach((ml: any) => lessonsMap.set(ml.title, ml));
                        
                        // Then add/override with Supabase lessons
                        sbLessons.forEach(sbL => {
                            lessonsMap.set(sbL.title, {
                                _id: sbL.id,
                                title: sbL.title,
                                type: sbL.type,
                                videoUrl: sbL.content_url,
                                pptUrl: sbL.content_url,
                                exerciseUrl: sbL.content_url,
                                content: sbL.quiz_data ? JSON.stringify(sbL.quiz_data) : null
                            });
                        });
                        
                        setLessons(Array.from(lessonsMap.values()));
                    } else {
                        setLessons(data.lessons || [])
                    }
                } else {
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
            setActiveLesson(lessons[0])
        }
    }, [lessons, activeLesson])

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

    const lectures = lessons.filter(l => l.type === 'video' || !l.type)
    const materials = lessons.filter(l => l.type === 'ppt' || l.type === 'document')
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
                    <div className="w-full h-full bg-slate-950 flex flex-col relative">
                        {activeLesson ? (
                            <div className="flex-1 w-full relative">
                                {activeLesson.type === "video" ? (
                                    <div className="w-full h-full aspect-video bg-black">
                                        {(activeLesson.videoUrl?.includes('youtube.com') || activeLesson.videoUrl?.includes('youtu.be')) ? (
                                            <iframe 
                                                src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                                                className="w-full h-full border-none"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : activeLesson.videoUrl ? (
                                            <video 
                                                src={activeLesson.videoUrl} 
                                                controls 
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                                <Video className="w-16 h-16 opacity-20" />
                                                <p className="font-bold text-sm uppercase tracking-widest">Video Stream Unavailable</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (activeLesson.type === "ppt" || activeLesson.type === "document") ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-slate-900 text-center">
                                        <div className="w-24 h-24 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-8 border border-amber-500/20">
                                            <FileText className="w-12 h-12 text-amber-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase italic mb-4">{activeLesson.title}</h3>
                                        <p className="text-slate-400 font-bold text-center max-w-md mb-8">This document is ready for review. Click below to open in a secure viewer or download for offline study.</p>
                                        <div className="flex items-center gap-4">
                                            <Button 
                                                className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase italic tracking-widest text-xs"
                                                onClick={() => window.open(activeLesson.pptUrl || activeLesson.content_url || activeLesson.videoUrl, '_blank')}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Open Document
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                className="h-14 px-8 rounded-2xl border-white/10 text-white hover:bg-white/5 font-black uppercase italic tracking-widest text-xs"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = activeLesson.pptUrl || activeLesson.content_url || activeLesson.videoUrl;
                                                    link.download = `${activeLesson.title}.pdf`;
                                                    link.click();
                                                }}
                                            >
                                                <FileDown className="w-4 h-4 mr-2" />
                                                Download PDF
                                            </Button>
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
                                    <div key={i} onClick={() => setActiveLesson(l)} className="group p-6 rounded-[32px] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-2xl transition-all cursor-pointer">
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
                        <TabsContent value="practice" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
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
        </div>
    )
}
