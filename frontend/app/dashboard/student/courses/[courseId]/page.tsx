"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    ArrowLeft, PlayCircle, Clock, Users, Star, CheckCircle,
    BookOpen, Video, MonitorPlay, Calendar, Zap, Lock,
    ChevronRight, GraduationCap, Sparkles, BrainCircuit, FileDown,
    Youtube, Book, ExternalLink, Library, ArrowUpRight, Search
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { courseApi, paymentApi, aiApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AIQuiz } from "@/components/dashboard/courses/ai-quiz"

export default function CourseDetailPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [activeLesson, setActiveLesson] = useState<any>(null)
    const [showQuiz, setShowQuiz] = useState(false)
    const [lessons, setLessons] = useState<any[]>([])
    const [aiResources, setAiResources] = useState<any>(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        const userStr = localStorage.getItem("user")
        if (userStr) setCurrentUser(JSON.parse(userStr))
    }, [])

    useEffect(() => {
        const loadCourse = async () => {
            setIsLoading(true)
            try {
                const data = await courseApi.getById(courseId)
                const courseData = {
                    id: data._id,
                    name: data.title,
                    tutor: data.instructor?.name || "Expert Tutor",
                    image: data.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
                    grade: data.gradeLevel || 12,
                    semester: "Semester 1",
                    rating: 4.8,
                    students: data.students?.length || 0,
                    description: data.description || "Master the fundamental concepts and advanced techniques in this comprehensive course.",
                    delivery: data.deliveryMethod || "Recorded",
                    progress: 0,
                    lessonsCount: data.lessons?.length || 0,
                    completed: 0,
                    priceValue: data.price || 0,
                    isPremium: (data.price > 0) || data.isPremium || false,
                    syllabusUrl: data.syllabusUrl,
                    enrolled: data.students?.includes(currentUser?._id) || data.students?.some((s: any) => s._id === currentUser?._id || s === currentUser?._id)
                }

                const txRef = searchParams.get("tx_ref")
                const status = searchParams.get("status")
                
                if (txRef && status === "success" && !courseData.enrolled) {
                    try {
                        await paymentApi.verify(txRef)
                        courseData.enrolled = true
                        toast({ title: "Welcome to Premium!", description: "Access granted successfully.", className: "bg-emerald-500 text-white" })
                    } catch (e) {
                        console.error("Verification failed:", e)
                    }
                }

                setCourse(courseData)
                setLessons(data.lessons || [])

                if (searchParams.get("continue") === "true" || courseData.enrolled) {
                    const firstIncomplete = (data.lessons || []).find((l: any) => !l.completed) || data.lessons?.[0]
                    if (firstIncomplete) setActiveLesson(firstIncomplete)
                }

                loadAiResources(courseData.name, courseData.grade, data.roadmap)
            } catch (error) {
                console.error("Load Error:", error)
                setCourse(null)
            } finally {
                setIsLoading(false)
            }
        }
        if (courseId) loadCourse()
    }, [courseId, searchParams, currentUser?._id])

    const loadAiResources = async (subject: string, grade: any, roadmap?: any) => {
        setIsAiLoading(true)
        try {
            const outline = roadmap ? JSON.stringify(roadmap) : ""
            const res = await aiApi.getResourceSuggestions(subject, grade, outline)
            setAiResources(res.data)
        } catch (error) {
            console.error("AI Error:", error)
        } finally {
            setIsAiLoading(false)
        }
    }

    const handleEnroll = async () => {
        if (!course) return
        setEnrolling(true)
        try {
            if (course.isPremium && course.priceValue > 0) {
                const res = await paymentApi.initialize({
                    amount: course.priceValue,
                    subjectId: courseId,
                    method: "chapa"
                })
                if (res.data?.checkout_url) {
                    window.location.href = res.data.checkout_url
                } else {
                    throw new Error("Failed to initialize payment gateway")
                }
            } else {
                await courseApi.enroll(courseId)
                toast({ title: "Enrollment Successful!", className: "bg-emerald-500 text-white border-none" })
                setCourse((prev: any) => ({ ...prev, enrolled: true }))
            }
        } catch (error: any) {
            toast({ title: "Enrollment Error", description: error.message, variant: "destructive" })
        } finally {
            setEnrolling(false)
        }
    }

    const handleLessonComplete = (score: number) => {
        setShowQuiz(false)
        if (activeLesson) {
            setLessons(prev => prev.map(l => l.id === activeLesson.id ? { ...l, completed: true } : l))
            toast({ title: "Lesson Completed!", className: "bg-emerald-500 text-white border-none" })
            setCourse((prev: any) => ({
                ...prev,
                completed: (prev.completed || 0) + 1,
                progress: Math.min(100, Math.round(((prev.completed + 1) / (prev.lessonsCount || 1)) * 100))
            }))
            setActiveLesson(null)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 p-8">
                <Skeleton className="h-10 w-48 rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-[40px]" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-10 w-3/4 rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                    <div className="space-y-4">
                        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                    </div>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                    <Search className="w-10 h-10 text-slate-200" />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase">Course Not Found</h2>
                <Button onClick={() => router.push('/dashboard/student/courses')} variant="outline" className="rounded-xl uppercase font-black text-[10px]">Back to Library</Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 lg:px-8">
            
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Library
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                        ))}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.students.toLocaleString()}+ Students Enrolled</span>
                </div>
            </div>

            {/* ── Hero / Video Player ── */}
            <div className="relative min-h-[300px] lg:min-h-[450px] rounded-[48px] overflow-hidden shadow-2xl bg-slate-900 group transition-all duration-700">
                {activeLesson ? (
                    <div className="w-full h-full min-h-[300px] lg:min-h-[450px] flex flex-col items-center justify-center relative">
                        {showQuiz ? (
                            <div className="w-full max-w-2xl p-8">
                                <AIQuiz lessonTitle={activeLesson.title} onComplete={handleLessonComplete} />
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-6 left-6 z-20">
                                    <Button 
                                        onClick={() => setActiveLesson(null)} 
                                        variant="outline" 
                                        className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-xl rounded-2xl font-black text-[9px] uppercase h-10 px-5"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Exit Lesson
                                    </Button>
                                </div>
                                <div className="w-full h-full aspect-video">
                                    <iframe
                                        width="100%" height="100%"
                                        src={`https://www.youtube.com/embed/${(() => {
                                            try {
                                                const url = new URL(activeLesson.videoUrl);
                                                if (url.hostname === 'youtu.be') return url.pathname.substring(1);
                                                return url.searchParams.get('v');
                                            } catch (e) { return activeLesson.videoUrl?.split('v=')[1]?.split('&')[0] || activeLesson.videoUrl; }
                                        })()}?autoplay=1&modestbranding=1&rel=0`}
                                        frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <img src={course.image} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        
                        <div className="absolute top-8 left-8 flex gap-3">
                            <Badge className="bg-indigo-500/90 text-white border-indigo-400 px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest backdrop-blur-md">
                                {course.delivery} Mode
                            </Badge>
                            {course.isPremium && (
                                <Badge className="bg-amber-400 text-amber-950 border-amber-300 px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Premium Access
                                </Badge>
                            )}
                        </div>

                        <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="max-w-2xl space-y-3">
                                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">Grade {course.grade} • {course.semester}</p>
                                <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl italic uppercase">
                                    {course.name}
                                </h1>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <p className="text-white/80 text-sm font-bold">{course.tutor}</p>
                                </div>
                            </div>
                            {course.enrolled && (
                                <Button 
                                    onClick={() => setActiveLesson(lessons[0])}
                                    className="bg-white hover:bg-indigo-50 text-indigo-600 h-16 px-10 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                                >
                                    <PlayCircle className="w-5 h-5 mr-3 fill-indigo-600/10" /> Resume Course
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* ── Left Column ── */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Users, label: "Community", value: `${course.students}+`, color: "sky" },
                            { icon: BookOpen, label: "Curriculum", value: `${course.lessonsCount} Modules`, color: "indigo" },
                            { icon: Star, label: "Expert Rating", value: course.rating, color: "amber" },
                            { icon: Clock, label: "Format", value: course.delivery, color: "emerald" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center text-${s.color}-500`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-sm font-black text-slate-900">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Course Overview</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-slate-400 uppercase">Live Verification Active</span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            {course.description}
                        </p>
                    </div>

                    {/* AI Academic Library */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-[24px] bg-indigo-50 flex items-center justify-center border border-indigo-100/50 shadow-inner">
                                    <Library className="w-7 h-7 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5">AI Academic Library</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Curated by Gemini • Grade {course.grade} Specialized</p>
                                </div>
                            </div>
                            {course.syllabusUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(course.syllabusUrl, '_blank')}
                                    className="h-11 px-6 rounded-2xl border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
                                >
                                    <FileDown className="w-4 h-4" /> Curriculum Outline
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Videos */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Youtube className="w-4 h-4 text-rose-500" /> Masterclass Videos
                                    </h4>
                                    <span className="text-[8px] font-black text-rose-400 uppercase bg-rose-50 px-2 py-0.5 rounded-full">HQ Streams</span>
                                </div>
                                <div className="space-y-4">
                                    {isAiLoading ? (
                                        [1, 2].map(i => <Skeleton key={i} className="h-24 rounded-3xl w-full" />)
                                    ) : aiResources?.videos?.map((res: any, i: number) => (
                                        <div 
                                            key={i}
                                            onClick={() => {
                                                setActiveLesson({ title: res.title, videoUrl: res.url, duration: "AI Curation", type: "video", isAI: true })
                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                            }}
                                            className="w-full group/res bg-slate-50/30 hover:bg-white p-5 rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl transition-all flex items-center justify-between cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover/res:bg-rose-50 transition-colors">
                                                    <PlayCircle className="w-5 h-5 text-slate-300 group-hover/res:text-rose-500" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-tight group-hover/res:text-indigo-600 transition-colors line-clamp-2 italic">{res.title}</p>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 inline-block">{res.language} Lecture</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover/res:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Books */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Book className="w-4 h-4 text-indigo-500" /> Digital Textbooks
                                    </h4>
                                    <span className="text-[8px] font-black text-indigo-400 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">Official MoE</span>
                                </div>
                                <div className="space-y-4">
                                    {isAiLoading ? (
                                        [1].map(i => <Skeleton key={i} className="h-24 rounded-3xl w-full" />)
                                    ) : aiResources?.books?.map((res: any, i: number) => (
                                        <div 
                                            key={i}
                                            onClick={() => window.open(res.url, '_blank')}
                                            className="w-full group/book bg-slate-50/30 hover:bg-white p-5 rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl transition-all flex items-center justify-between cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover/book:bg-indigo-50 transition-colors">
                                                    <BookOpen className="w-5 h-5 text-slate-300 group-hover/book:text-indigo-500" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-tight group-hover/book:text-indigo-600 transition-colors line-clamp-2 italic">{res.title}</p>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 inline-block">{res.type} Portal</span>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/book:translate-x-0.5 group-hover/book:-translate-y-0.5 transition-all" />
                                        </div>
                                    ))}
                                    {!isAiLoading && (!aiResources?.books || aiResources.books.length === 0) && (
                                        <div className="p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Search className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching MoE Archives...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column ── */}
                <div className="space-y-8">
                    
                    {/* Progress Bar (Sticky-ish) */}
                    {course.enrolled && (
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20">
                                <Zap className="w-12 h-12 text-indigo-400 fill-indigo-400" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Platform Mastery</h4>
                            <div className="flex items-end justify-between mb-4">
                                <span className="text-4xl font-black tracking-tighter italic">{course.progress}%</span>
                                <span className="text-[9px] font-black uppercase text-indigo-300 mb-1">Rank: Rising Star</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Enrollment CTA */}
                    {!course.enrolled && (
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900 uppercase italic">Get Started</h3>
                                {course.isPremium && (
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-900">{course.priceValue}</span>
                                        <span className="text-[9px] font-bold text-slate-400 ml-1">ETB</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Join our specialized community and unlock expert-led curriculum, AI-powered quizzes, and official certificates.
                            </p>
                            <Button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all"
                            >
                                {enrolling ? "Enrolling..." : course.isPremium ? "Unlock Premium" : "Enroll Now"}
                            </Button>
                        </div>
                    )}

                    {/* Content List */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase italic">Curriculum</h3>
                            <Badge variant="secondary" className="rounded-lg text-[9px] font-black uppercase bg-slate-50">{lessons.length} Modules</Badge>
                        </div>

                        <div className="space-y-3">
                            {lessons.length > 0 ? lessons.map((lesson, idx) => {
                                const isLocked = !course.enrolled && idx > 0;
                                const isActive = activeLesson?.id === lesson.id || activeLesson?.title === lesson.title;
                                return (
                                    <div
                                        key={lesson._id || idx}
                                        onClick={() => {
                                            if (isLocked) {
                                                toast({ title: "Module Locked", description: "Enroll to unlock full access.", variant: "destructive" })
                                                return
                                            }
                                            setActiveLesson(lesson)
                                            setShowQuiz(false)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border transition-all cursor-pointer group/item flex items-center justify-between",
                                            isActive ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                                lesson.completed ? "bg-emerald-50 border-emerald-100" :
                                                isActive ? "bg-white border-indigo-200 shadow-sm" : "bg-white border-slate-100"
                                            )}>
                                                {lesson.completed ? <CheckCircle className="w-5 h-5 text-emerald-500" /> :
                                                 isLocked ? <Lock className="w-4 h-4 text-slate-300" /> :
                                                 <PlayCircle className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-300")} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className={cn("text-[11px] font-black uppercase truncate italic", isActive ? "text-indigo-600" : "text-slate-900")}>
                                                    {lesson.title}
                                                </h4>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{lesson.duration || "15 min"} • {lesson.type || "Video"}</p>
                                            </div>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                    </div>
                                )
                            }) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-40">
                                    <MonitorPlay className="w-10 h-10 text-slate-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Modules Uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "secondary" }) {
    return (
        <div className={cn("px-2 py-1 rounded-md text-xs font-bold", className)}>
            {children}
        </div>
    )
}
