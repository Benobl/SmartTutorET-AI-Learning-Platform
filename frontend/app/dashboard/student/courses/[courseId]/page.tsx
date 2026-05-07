"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    ArrowLeft, PlayCircle, Clock, Users, Star, CheckCircle,
    BookOpen, Video, MonitorPlay, Calendar, Zap, Lock,
    ChevronRight, GraduationCap, Sparkles, BrainCircuit, FileDown,
    Youtube, Book, ExternalLink, Library
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { courseApi, paymentApi, aiApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AIQuiz } from "@/components/dashboard/courses/ai-quiz"


// ── Mock Lesson Data ─────────────────────────────────────────
const MOCK_LESSONS = [
    { id: 1, title: "Introduction & Course Overview", duration: "12 min", completed: true, type: "video" },
    { id: 2, title: "Core Concepts & Foundations", duration: "28 min", completed: true, type: "video" },
    { id: 3, title: "Practice Problems Set 1", duration: "45 min", completed: true, type: "exercise" },
    { id: 4, title: "Advanced Techniques", duration: "35 min", completed: false, type: "video" },
    { id: 5, title: "Real-World Applications", duration: "30 min", completed: false, type: "video" },
    { id: 6, title: "Mid-Course Assessment", duration: "60 min", completed: false, type: "quiz" },
    { id: 7, title: "Deep Dive: Special Topics", duration: "40 min", completed: false, type: "video" },
    { id: 8, title: "Final Review & Summary", duration: "25 min", completed: false, type: "video" },
]

const MOCK_COURSE = {
    name: "Loading...",
    tutor: "Expert Tutor",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    grade: "Grade 12",
    semester: "Semester 1",
    rating: 4.8,
    students: 1240,
    description: "Master the fundamental concepts and advanced techniques in this comprehensive course designed specifically for Ethiopian secondary school students. This course follows the national curriculum and includes practice materials for national exam preparation.",
    delivery: "Recorded",
    progress: 37,
    lessons: 8,
    completed: 3,
}

export default function CourseDetailPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()
    const courseId = params.courseId as string
    const isPremiumEnroll = searchParams.get("enroll") === "premium"

    const [course, setCourse] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [activeLesson, setActiveLesson] = useState<any>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [showQuiz, setShowQuiz] = useState(false)
    const [lessons, setLessons] = useState<any[]>(MOCK_LESSONS)
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
                    image: data.thumbnail || MOCK_COURSE.image,
                    grade: `Grade ${data.gradeLevel || 12}`,
                    semester: "Semester 1",
                    rating: 4.8,
                    students: data.students?.length || 0,
                    description: data.description || MOCK_COURSE.description,
                    delivery: data.deliveryMethod || "Recorded",
                    progress: 0,
                    lessonsCount: data.lessons?.length || MOCK_LESSONS.length,
                    completed: 0,
                    priceValue: data.price || 0,
                    isPremium: (data.price > 0) || data.isPremium || false,
                    syllabusUrl: data.syllabusUrl,
                    enrolled: data.students?.includes(currentUser?._id) || data.students?.some((s: any) => s._id === currentUser?._id || s === currentUser?._id)
                }
                // Handle payment callback verification
                const txRef = searchParams.get("tx_ref")
                const status = searchParams.get("status")
                
                if (txRef && status === "success" && !courseData.enrolled) {
                    toast({ title: "Verifying Payment", description: "Completing your enrollment..." })
                    try {
                        await paymentApi.verify(txRef)
                        courseData.enrolled = true
                        toast({ title: "Welcome to Premium!", description: "Access granted successfully.", className: "bg-emerald-500 text-white" })
                    } catch (e) {
                        console.error("Verification failed:", e)
                    }
                }

                setCourse(courseData)
                let currentLessons = MOCK_LESSONS
                if (data.lessons && data.lessons.length > 0) {
                    currentLessons = data.lessons
                }
                setLessons(currentLessons)

                // Auto-select lesson if 'continue' is active
                if (searchParams.get("continue") === "true" || courseData.enrolled) {
                    const firstIncomplete = currentLessons.find(l => !l.completed) || currentLessons[0]
                    setActiveLesson(firstIncomplete)
                }

                // Load AI Resources
                loadAiResources(courseData.name, data.gradeLevel)
            } catch {
                setCourse({
                    ...MOCK_COURSE,
                    id: courseId,
                    name: "Unknown Course",
                })
            } finally {
                setIsLoading(false)
            }
        }
        loadCourse()
    }, [courseId, searchParams])

    const loadAiResources = async (subject: string, grade: number) => {
        setIsAiLoading(true)
        try {
            const res = await aiApi.getResourceSuggestions(subject, grade)
            setAiResources(res.data)
        } catch (error) {
            console.error("AI Error:", error)
        } finally {
            setIsAiLoading(false)
        }
    }


    const handleEnroll = async () => {
        if (!course) return
        
        // Only trigger payment if it's premium AND has a price > 0
        if (course.isPremium && course.priceValue > 0) {
            try {
                setEnrolling(true)
                const res = await paymentApi.initialize({
                    amount: course.priceValue,
                    subjectId: courseId,
                    method: "chapa"
                })
                
                if (res.data?.checkout_url) {
                    toast({ title: "Redirecting to Chapa", description: "Opening secure gateway..." })
                    window.location.href = res.data.checkout_url
                } else {
                    throw new Error("Failed to initialize payment gateway")
                }
            } catch (error: any) {
                toast({
                    title: "Enrollment Error",
                    description: error.message || "Could not initialize payment.",
                    variant: "destructive"
                })
            } finally {
                setEnrolling(false)
            }
            return
        }

        setEnrolling(true)
        try {
            await courseApi.enroll(courseId)
            toast({ 
                title: "Enrollment Successful!", 
                description: `You now have access to ${course.name}.`,
                className: "bg-emerald-500 text-white border-none"
            })
            setCourse((prev: any) => ({ ...prev, enrolled: true }))
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
            toast({
                title: "Lesson Completed!",
                description: `You scored ${score}% on the quiz. Well done!`,
                className: "bg-emerald-500 text-white border-none"
            })
            // Update course progress
            setCourse((prev: any) => ({
                ...prev,
                completed: (prev.completed || 0) + 1,
                progress: Math.min(100, Math.round(((prev.completed + 1) / prev.lessonsCount) * 100))
            }))
            setActiveLesson(null)
        }
    }


    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
                <Skeleton className="h-10 w-48 rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-[40px]" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-10 w-3/4 rounded-xl" />
                        <Skeleton className="h-6 w-1/2 rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-4">
                        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">

            {/* ── Back Button ── */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-sky-600 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Courses
            </button>

            {/* ── Hero / Content Area ── */}
            <div className="relative min-h-[250px] lg:min-h-[320px] rounded-[40px] overflow-hidden shadow-xl bg-white border border-slate-100 group transition-all duration-500">
                {activeLesson ? (
                    <div className="w-full h-full min-h-[250px] lg:min-h-[320px] bg-slate-50/50 flex flex-col items-center justify-center p-6 lg:p-10 relative">
                        {showQuiz ? (
                            <div className="w-full max-w-2xl">
                                <AIQuiz
                                    lessonTitle={activeLesson.title}
                                    onComplete={handleLessonComplete}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex gap-2 z-10">
                                    <button
                                        onClick={() => setActiveLesson(null)}
                                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Exit
                                    </button>
                                </div>

                                {/* Video Player / Content */}
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                                    {activeLesson.videoUrl ? (
                                        <div className="w-full aspect-video rounded-[32px] overflow-hidden bg-black border-4 border-white shadow-2xl relative">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${(() => {
                                                    try {
                                                        const url = new URL(activeLesson.videoUrl);
                                                        if (url.hostname === 'youtu.be') return url.pathname.substring(1);
                                                        return url.searchParams.get('v');
                                                    } catch (e) {
                                                        return activeLesson.videoUrl.split('v=')[1]?.split('&')[0] || activeLesson.videoUrl;
                                                    }
                                                })()}`}
                                                title={activeLesson.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-md border border-slate-100">
                                                <PlayCircle className="w-8 h-8 text-sky-500 fill-sky-50" />
                                                <div className="absolute inset-0 rounded-full border-2 border-sky-100/50 animate-pulse" />
                                            </div>
                                            <div className="text-center space-y-1 max-w-lg">
                                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeLesson.title}</h2>
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{course?.name} • Grade {course?.grade}</p>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex gap-2.5 pt-1">
                                        <Button
                                            onClick={() => setShowQuiz(true)}
                                            className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <BrainCircuit className="w-3.5 h-3.5" /> Start AI Practice Quiz
                                        </Button>

                                        {/* Next Lesson Button */}
                                        {(() => {
                                            const currentIndex = lessons.findIndex(l => l.id === activeLesson.id)
                                            const nextL = lessons[currentIndex + 1]
                                            return nextL && (
                                                <Button
                                                    onClick={() => setActiveLesson(nextL)}
                                                    variant="ghost"
                                                    className="h-10 px-4 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                                                >
                                                    Next Lesson <ChevronRight className="w-3.5 h-3.5" />
                                                </Button>
                                            )
                                        })()}
                                    </div>

                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <img src={course?.image} alt={course?.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-6 left-6 flex gap-2">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-xl flex items-center gap-1.5",
                                course?.delivery === "Live"
                                    ? "bg-rose-500/90 text-white border-rose-400"
                                    : "bg-sky-500/90 text-white border-sky-400"
                            )}>
                                {course?.delivery === "Live" ? <Video className="w-3 h-3" /> : <MonitorPlay className="w-3 h-3" />}
                                {course?.delivery} Class
                            </span>
                            <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-xl border border-white/40">
                                {course?.grade}
                            </span>
                            {course?.isPremium && (
                                <span className="text-[9px] font-black text-amber-900 uppercase tracking-widest bg-amber-400 px-3.5 py-1.5 rounded-xl shadow-xl border border-amber-300 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Premium
                                </span>
                            )}
                        </div>

                        {/* Course Title Overlay */}
                        <div className="absolute bottom-8 left-8 right-8">
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-lg">
                                {course?.name}
                            </h1>
                            <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> {course?.tutor}
                            </p>
                        </div>

                        {/* Continue Button Overlay */}
                        {course?.enrolled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                    onClick={() => {
                                        const firstIncomplete = lessons.find(l => !l.completed) || lessons[0]
                                        setActiveLesson(firstIncomplete)
                                    }}
                                    className="bg-white text-sky-600 font-black px-6 h-10 rounded-xl shadow-2xl hover:bg-sky-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest"
                                >
                                    <PlayCircle className="w-4 h-4" /> Resume Learning
                                </Button>
                            </div>
                        )}



                        {/* Rating  */}
                        <div className="absolute top-6 right-6 flex items-center gap-1 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-white/40">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-black text-slate-700">{course?.rating?.toFixed(1)}</span>
                        </div>
                    </>
                )}
            </div>


            {/* ── Main Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Course Info */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: Users, label: "Students", value: `${(course?.students || 0).toLocaleString()}+` },
                            { icon: BookOpen, label: "Lessons", value: course?.lessonsCount || course?.lessons },
                            { icon: Clock, label: "Completed", value: `${course?.completed || 0}/${course?.lessonsCount || course?.lessons}` },

                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-[24px] border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-[16px] bg-sky-50 flex items-center justify-center border border-sky-100">
                                    <stat.icon className="w-5 h-5 text-sky-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-lg font-black text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress (if enrolled) */}
                    {course?.enrolled && (
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm group hover:border-sky-100 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-sky-500 fill-sky-500" /> Mastery Level
                                    </span>
                                    <h4 className="text-sm font-black text-slate-900 uppercase mt-1">Course Progress</h4>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-sky-600 italic leading-none">{course?.progress || 0}%</span>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Next Milestone at 50%</p>
                                </div>
                            </div>
                            <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${course?.progress || 0}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* AI Smart Resources (Prominent for all) */}
                    <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-[40px] border border-indigo-100 p-10 shadow-sm space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Sparkles className="w-12 h-12 text-indigo-200/50" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest">AI Academic Bridge</span>
                                    <BrainCircuit className="w-4 h-4 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none">
                                    {course?.enrolled ? "Academic" : "Starting"} <span className="text-indigo-600">{course?.enrolled ? "Resources" : "Soon!"}</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight max-w-md">
                                    {course?.enrolled 
                                        ? `Explore high-quality materials curated specifically for ${course?.grade} ${course?.name} to supplement your learning.`
                                        : `While we prepare the live classroom, dive into these specific ${course?.grade} ${course?.name} resources curated just for you.`}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-3xl border border-indigo-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                    {course?.enrolled ? <Library className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-pulse" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Status</p>
                                        <p className="text-[9px] font-bold text-amber-600 uppercase">Class Begins Soon</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* YouTube Multilingual */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Youtube className="w-4 h-4 text-rose-500" /> Specific Video Lectures
                                        </h4>
                                        <span className="text-[8px] font-black text-indigo-500 uppercase italic">Grade {course?.grade} Specialized</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {aiResources && aiResources.videos?.map((vid: any, i: number) => (
                                            <div 
                                                key={i}
                                                onClick={() => {
                                                    setActiveLesson({
                                                        title: vid.title,
                                                        videoUrl: vid.url,
                                                        duration: "AI Suggested",
                                                        type: "video",
                                                        isAI: true
                                                    })
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                    toast({ title: "Playing AI Resource", description: vid.title })
                                                }}
                                                className="group/vid bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all text-left space-y-3 cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 -mr-10 -mt-10 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
                                                <div className="flex items-center justify-between relative z-10">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-tighter",
                                                        vid.language === "Amharic" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                        vid.language === "Afaan Oromo" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        "bg-sky-50 text-sky-600 border border-sky-100"
                                                    )}>
                                                        {vid.language} Version
                                                    </span>
                                                    <PlayCircle className="w-4 h-4 text-slate-300 group-hover/vid:text-indigo-500 transition-colors" />
                                                </div>
                                                <p className="text-[11px] font-black text-slate-800 line-clamp-2 leading-relaxed group-hover/vid:text-indigo-600 transition-colors uppercase italic relative z-10">{vid.title}</p>
                                                <div className="flex items-center gap-2 pt-1 opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                                    <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest">Watch Now →</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reading Materials */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Book className="w-4 h-4 text-indigo-500" /> Digital Library
                                    </h4>
                                    <div className="space-y-3">
                                        {aiResources && aiResources.books?.map((book: any, i: number) => (
                                            <div 
                                                key={i}
                                                onClick={() => window.open(book.url, '_blank')}
                                                className="w-full group/book bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover/book:bg-indigo-50 transition-colors">
                                                    <BookOpen className="w-4 h-4 text-slate-400 group-hover/book:text-indigo-500" />
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <p className="text-[10px] font-black text-slate-800 truncate uppercase">{book.title}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{book.type}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">More Books Loading...</p>
                                            <p className="text-[7px] font-bold text-slate-400 uppercase">Stay tuned, we'll be back!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    {/* Resources Section (Manual) */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">About This Course</h3>
                            {course?.syllabusUrl && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(course.syllabusUrl, '_blank')}
                                    className="h-9 px-4 rounded-xl border-sky-100 text-sky-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-sky-50 transition-all"
                                >
                                    <FileDown className="w-3.5 h-3.5" /> Download Syllabus
                                </Button>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{course?.description}</p>
                    </div>

                    {/* Resources Section */}
                    <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <Library className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Learning Resources</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Curated materials for this subject</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Video Resources */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Youtube className="w-4 h-4 text-rose-500" /> Video Lectures
                                </h4>
                                <div className="space-y-3">
                                    {isAiLoading ? (
                                        [1, 2].map(i => <Skeleton key={i} className="h-16 rounded-2xl w-full" />)
                                    ) : aiResources?.videos?.map((res: any, i: number) => (
                                        <div 
                                            key={i}
                                            onClick={() => window.open(res.url, '_blank')}
                                            className="w-full group/res bg-slate-50/50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="text-left">
                                                <p className="text-xs font-black text-slate-800 group-hover:text-sky-600 transition-colors">{res.title}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{res.language || 'English'}</p>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-500 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Book Resources */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Book className="w-4 h-4 text-sky-500" /> Recommended Books
                                </h4>
                                <div className="space-y-3">
                                    {isAiLoading ? (
                                        [1, 2].map(i => <Skeleton key={i} className="h-16 rounded-2xl w-full" />)
                                    ) : aiResources?.books?.map((res: any, i: number) => (
                                        <div 
                                            key={i}
                                            onClick={() => window.open(res.url, '_blank')}
                                            className="w-full group/res bg-slate-50/50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="text-left">
                                                <p className="text-xs font-black text-slate-800 group-hover:text-sky-600 transition-colors">{res.title}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{res.type || 'PDF Reference'}</p>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-500 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Lessons Sidebar */}
                <div className="space-y-6">

                    {/* Premium Enrollment CTA Case: Premium & Not Enrolled */}
                    {course?.isPremium && !course?.enrolled && (
                        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 space-y-6 relative overflow-hidden group/premium">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-50">
                                        <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Content</h3>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-slate-900">{course?.priceValue}</span>
                                    <span className="text-[10px] font-black text-slate-400 ml-1 uppercase">ETB</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                                Get lifetime access to all recorded sessions, live Q&A sessions, and personalized AI assessments.
                            </p>
                            <Button
                                onClick={() => handleEnroll()}
                                disabled={enrolling}
                                className="w-full h-12 rounded-xl bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-600 hover:text-sky-600 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all group/btn"
                            >
                                {enrolling ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-3.5 h-3.5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" /> Enrolling...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5 mr-1" /> Unlock Course
                                    </span>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Free Enrollment CTA Case: Not Premium & Not Enrolled */}
                    {!course?.isPremium && !course?.enrolled && (
                        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-400" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-50">
                                        <BookOpen className="w-5 h-5 text-sky-500" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Access</h3>
                                </div>
                            </div>
                            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                                Join this course for free and start your learning journey with our expert tutors today.
                            </p>
                            <Button
                                onClick={() => handleEnroll()}
                                disabled={enrolling}
                                className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-200 transition-all"
                            >
                                {enrolling ? "Enrolling..." : "Enroll for Free"}
                            </Button>
                        </div>
                    )}

                    {/* Real Lessons List */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Course Content</h3>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{lessons.length} Lessons</span>
                        </div>

                        <div className="space-y-2">
                            {lessons.map((lesson, idx) => {
                                const isLocked = !course?.enrolled && idx > 0;
                                return (
                                    <div
                                        key={lesson.id || idx}
                                        onClick={() => {
                                            if (isLocked) {
                                                toast({
                                                    title: "Lesson Locked",
                                                    description: "Please enroll to access this lesson.",
                                                    variant: "destructive"
                                                })
                                                return
                                            }
                                            setActiveLesson(lesson)
                                            setShowQuiz(false)
                                            toast({ title: `Playing: ${lesson.title}`, description: `Lesson ${idx + 1} of ${lessons.length}`, duration: 2000 })
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-[20px] text-left transition-all group/lesson cursor-pointer",
                                            activeLesson?.id === lesson.id || activeLesson?.title === lesson.title
                                                ? "bg-sky-50 border border-sky-200"
                                                : "hover:bg-slate-50 border border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-colors",
                                            lesson.completed
                                                ? "bg-emerald-50 border border-emerald-100"
                                                : (activeLesson?.id === lesson.id || activeLesson?.title === lesson.title)
                                                    ? "bg-sky-100 border border-sky-200"
                                                    : "bg-slate-50 border border-slate-100"
                                        )}>
                                            {lesson.completed ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            ) : isLocked ? (
                                                <Lock className="w-4 h-4 text-slate-300" />
                                            ) : (
                                                <PlayCircle className={cn("w-4 h-4", (activeLesson?.id === lesson.id || activeLesson?.title === lesson.title) ? "text-sky-500" : "text-slate-300")} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-xs font-black truncate transition-colors",
                                                lesson.completed ? "text-emerald-600" : (activeLesson?.id === lesson.id || activeLesson?.title === lesson.title) ? "text-sky-600" : "text-slate-800"
                                            )}>
                                                {lesson.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lesson.duration}</p>
                                                {lesson.completed && (
                                                    <span className="text-[7px] font-black text-sky-600 uppercase tracking-widest bg-white border border-sky-100 px-1.5 py-0.5 rounded shadow-sm">Review Available</span>
                                                )}
                                                {(activeLesson?.id === lesson.id || activeLesson?.title === lesson.title) && (
                                                    <span className="text-[7px] font-black text-indigo-600 uppercase tracking-widest bg-white border border-indigo-100 px-1.5 py-0.5 rounded shadow-sm animate-pulse">Now Playing</span>
                                                )}
                                            </div>
                                        </div>

                                        {lesson.completed ? (
                                            <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Completed</div>
                                        ) : isLocked ? (
                                            <Lock className="w-3.5 h-3.5 text-slate-200" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover/lesson:text-sky-400 group-hover/lesson:translate-x-1 transition-all" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

