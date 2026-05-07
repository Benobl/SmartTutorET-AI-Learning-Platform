"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
    ArrowLeft, PlayCircle, Clock, Users, Star, CheckCircle,
    BookOpen, Video, MonitorPlay, Calendar, Zap, Lock,
    ChevronRight, GraduationCap, Sparkles, BrainCircuit
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { courseApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { PaymentModal } from "@/components/dashboard/courses/payment-modal"
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
                    priceValue: data.price || 499,
                    isPremium: data.isPremium || false,
                    enrolled: data.students?.includes("current-user-id") // Mock check
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
            } catch {
                setCourse({
                    ...MOCK_COURSE,
                    id: courseId,
                    priceValue: 499,
                    isPremium: isPremiumEnroll,
                    enrolled: false
                })
            } finally {
                setIsLoading(false)
            }
        }
        loadCourse()
    }, [courseId, isPremiumEnroll, searchParams])


    const handleEnroll = async (paymentId?: string) => {
        if (!course) return

        if (course.isPremium && !paymentId) {
            setIsPaymentModalOpen(true)
            return
        }

        setEnrolling(true)
        try {
            await courseApi.enroll(courseId, paymentId ? { paymentId, provider: "telebir" } : {})
            toast({ title: "Enrollment Successful!", description: `You are now enrolled in ${course.name}.` })
            setCourse((prev: any) => ({ ...prev, enrolled: true }))
        } catch (error: any) {
            toast({ title: "Enrollment Failed", description: error.response?.data?.message || error.message || "Please try again.", variant: "destructive" })
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

                                {/* Video Player Placeholder */}
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                                    <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-md border border-slate-100">
                                        <PlayCircle className="w-8 h-8 text-sky-500 fill-sky-50" />
                                        <div className="absolute inset-0 rounded-full border-2 border-sky-100/50 animate-pulse" />
                                    </div>
                                    <div className="text-center space-y-1 max-w-lg">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeLesson.title}</h2>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Physics Unit 4.2 • Mastery Level: Intermediate</p>
                                    </div>
                                    <div className="flex gap-2.5 pt-1">
                                        <Button className="h-10 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-sky-100 transition-all border-0">
                                            Start Video
                                        </Button>
                                        <Button
                                            onClick={() => setShowQuiz(true)}
                                            variant="outline"
                                            className="h-10 px-6 rounded-xl border-2 border-sky-100 hover:bg-sky-50 text-sky-600 font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <BrainCircuit className="w-3.5 h-3.5" /> Practice Quiz
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
                    {course?.progress !== undefined && (
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-sky-500 fill-sky-500" /> Mastery Level
                                </span>
                                <span className="text-sm font-black text-sky-600">{course?.progress}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${course?.progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">About This Course</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{course?.description}</p>
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
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Enrollment</h3>
                                </div>
                                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-1 rounded-lg">Open</span>
                            </div>
                            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                                Join this course for free and start your learning journey with our core curriculum.
                            </p>
                            <Button
                                onClick={() => handleEnroll()}
                                disabled={enrolling}
                                className="w-full h-12 rounded-xl bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-600 hover:text-sky-600 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all"
                            >
                                {enrolling ? "Processing..." : "Enroll for Free"}
                            </Button>
                        </div>
                    )}




                    {/* Lesson List */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 px-2">Course Lessons</h3>
                        <div className="space-y-2">
                            {lessons.map((lesson, idx) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => {
                                        if (!course?.enrolled && idx > 0) {
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
                                        "w-full flex items-center gap-4 p-4 rounded-[20px] text-left transition-all group/lesson",
                                        activeLesson?.id === lesson.id
                                            ? "bg-sky-50 border border-sky-200"
                                            : "hover:bg-slate-50 border border-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-colors",
                                        lesson.completed
                                            ? "bg-emerald-50 border border-emerald-100"
                                            : activeLesson?.id === lesson.id
                                                ? "bg-sky-100 border border-sky-200"
                                                : "bg-slate-50 border border-slate-100"
                                    )}>
                                        {lesson.completed ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        ) : !course?.enrolled && idx > 0 ? (
                                            <Lock className="w-4 h-4 text-slate-300" />
                                        ) : (
                                            <PlayCircle className={cn("w-4 h-4", activeLesson?.id === lesson.id ? "text-sky-500" : "text-slate-300")} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-xs font-black truncate transition-colors",
                                            lesson.completed ? "text-emerald-600" : activeLesson?.id === lesson.id ? "text-sky-600" : "text-slate-800"
                                        )}>
                                            {lesson.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lesson.duration}</p>
                                            {lesson.completed && (
                                                <span className="text-[7px] font-black text-sky-600 uppercase tracking-widest bg-white border border-sky-100 px-1.5 py-0.5 rounded shadow-sm">Review Available</span>
                                            )}
                                            {activeLesson?.id === lesson.id && (
                                                <span className="text-[7px] font-black text-indigo-600 uppercase tracking-widest bg-white border border-indigo-100 px-1.5 py-0.5 rounded shadow-sm animate-pulse">Now Playing</span>
                                            )}
                                        </div>
                                    </div>

                                    {lesson.completed ? (
                                        <Button
                                            variant="ghost"
                                            className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-sky-600 hover:bg-sky-50"
                                            onClick={() => setActiveLesson(lesson)}
                                        >
                                            Review
                                        </Button>
                                    ) : (
                                        <ChevronRight className={cn(
                                            "w-4 h-4 transition-colors shrink-0",
                                            activeLesson?.id === lesson.id ? "text-sky-500" : "text-slate-200 group-hover/lesson:text-sky-400"
                                        )} />
                                    )}

                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Payment Modal ── */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                courseName={course?.name || ""}
                price={course?.priceValue || 499}
                courseId={courseId}
                onSuccess={(id) => handleEnroll(id)}
            />
        </div>
    )
}

