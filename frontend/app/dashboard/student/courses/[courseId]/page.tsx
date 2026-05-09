"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    ArrowLeft, PlayCircle, Clock, Users, Star, CheckCircle,
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
                setLessons(data.lessons || [])
                
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
    const practice = [...lessons.filter(l => l.type === 'quiz' || l.type === 'exercise'), ...assignments]

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* ── High-Fidelity Focus Player ── */}
            <div className="bg-[#0F172A] h-[55vh] min-h-[450px] relative overflow-hidden group shadow-2xl">
                {activeLesson ? (
                    <div className="w-full h-full animate-in fade-in zoom-in duration-700">
                        {activeLesson.type === 'video' || !activeLesson.type ? (
                            <iframe 
                                className="w-full h-full shadow-inner bg-black"
                                src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        ) : activeLesson.type === 'ppt' || activeLesson.type === 'document' ? (
                            <div className="w-full h-full bg-white flex flex-col items-center justify-center p-20 text-center relative">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 via-transparent to-transparent opacity-50" />
                                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-10 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                                    <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 max-w-3xl leading-tight">{activeLesson.title}</h2>
                                <div className="flex items-center gap-4">
                                    <Button 
                                        onClick={() => window.open(activeLesson.pptUrl || activeLesson.videoUrl, '_blank')}
                                        className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95"
                                    >
                                        Open Document <ExternalLink className="w-4 h-4 ml-3" />
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => window.open(activeLesson.pptUrl || activeLesson.videoUrl, '_blank')}
                                        className="h-14 px-10 rounded-2xl border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all"
                                    >
                                        Download PDF <FileDown className="w-4 h-4 ml-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : activeLesson.type === 'quiz' || activeLesson.type === 'exercise' ? (
                            <div className="w-full h-full bg-slate-50/50 flex flex-col items-center justify-center p-12 overflow-y-auto">
                                <div className="w-full max-w-4xl">
                                    <AIQuiz 
                                        lessonTitle={activeLesson.title}
                                        type={activeLesson.type as any}
                                        onComplete={(percentage) => {
                                            toast({ title: "Module Complete", description: `You scored ${percentage}% in ${activeLesson.title}` })
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-white flex flex-col items-center justify-center text-slate-900 p-20 text-center relative">
                                <Sparkles className="w-20 h-20 mb-8 text-sky-400 opacity-20" />
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-slate-900">Interactive Content</h2>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] opacity-80">{activeLesson.title}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <div className="absolute inset-0 bg-white" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 max-w-5xl mx-auto">
                            <Badge className="bg-sky-50 text-sky-600 border border-sky-100 px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase mb-10 shadow-sm">Grade {course.grade} • Academic Track</Badge>
                            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 italic uppercase tracking-tighter mb-10 leading-[0.9]">
                                {course.name.split(' ').map((word: string, i: number) => (
                                    <span key={i} className={i % 2 === 1 ? "text-sky-600" : ""}>{word} </span>
                                ))}
                            </h1>
                            
                            {!course.enrolled ? (
                                <Button 
                                    onClick={handleEnroll} 
                                    disabled={enrolling}
                                    className="h-20 px-16 rounded-[32px] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-slate-200 hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
                                >
                                    {enrolling ? "Synchronizing..." : `Initialize Learning for ${course.priceValue} ETB`}
                                    <ArrowRight className="w-6 h-6" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={() => setActiveLesson(lessons[0])}
                                    className="h-20 px-16 rounded-[32px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-sky-100 hover:scale-105 transition-all active:scale-95 flex items-center gap-4"
                                >
                                    <PlayCircle className="w-6 h-6" />
                                    Resume Mastering
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                {activeLesson && (
                    <Button 
                        onClick={() => setActiveLesson(null)}
                        className="absolute top-10 left-10 h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-2xl font-black uppercase text-[10px] tracking-[0.2em] z-50 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 mr-3" /> Minimize View
                    </Button>
                )}
            </div>

            {/* ── Modern Content Architecture ── */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-20">
                <Tabs defaultValue="lectures" className="w-full" onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                        <TabsList className="h-20 bg-white p-2 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 flex items-stretch min-w-[600px]">
                            <TabsTrigger value="lectures" className="flex-1 rounded-[24px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all duration-500">
                                <Video className="w-4 h-4 mr-3" /> Lectures
                            </TabsTrigger>
                            <TabsTrigger value="materials" className="flex-1 rounded-[24px] data-[state=active]:bg-amber-500 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all duration-500">
                                <Book className="w-4 h-4 mr-3" /> Resources
                            </TabsTrigger>
                            <TabsTrigger value="practice" className="flex-1 rounded-[24px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all duration-500">
                                <Zap className="w-4 h-4 mr-3" /> Practice
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
                                <div key={i} className="group p-8 rounded-[48px] bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-8">
                                        <div className="w-20 h-20 rounded-[32px] bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                                            <Zap className="w-10 h-10 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase italic text-xl mb-2">{l.title}</h4>
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase">10 Questions</Badge>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Activity</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => { setActiveLesson(l); setShowQuiz(true); }}
                                        className="h-16 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                                    >
                                        Start Assessment
                                    </Button>
                                </div>
                            ))}
                            {practice.length === 0 && <div className="py-20 text-center font-black uppercase text-slate-400 italic">No assessments available yet.</div>}
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
