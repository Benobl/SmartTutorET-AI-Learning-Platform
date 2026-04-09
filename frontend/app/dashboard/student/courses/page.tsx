"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Search, Filter, MoreVertical, PlayCircle, FileText, LayoutGrid, List, Star, Users, CheckCircle, Sparkles, ChevronRight, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const CATEGORIES = ["All", "National Exams", "STEM", "Humanities", "Language", "Vocational"]

const MY_COURSES = [
    {
        id: 1,
        name: "Mathematics - Calculus",
        tutor: "Dr. Kebede Kassaye",
        progress: 65,
        lessons: 24,
        completed: 15,
        lastAccessed: "2 hours ago",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        tags: ["Math", "Grade 12"]
    },
    {
        id: 2,
        name: "Physics - Mechanics",
        tutor: "Prof. Liya Tekle",
        progress: 32,
        lessons: 18,
        completed: 6,
        lastAccessed: "Yesterday",
        image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
        tags: ["Science", "Grade 11"]
    },
    {
        id: 3,
        name: "English Literature",
        tutor: "Ms. Bethlehem Assefa",
        progress: 89,
        lessons: 12,
        completed: 11,
        lastAccessed: "3 days ago",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
        tags: ["English", "Grade 10"]
    },
]

const CATALOG_COURSES = [
    {
        id: 101,
        name: "Biology - Genetics",
        tutor: "Dr. Aster Gebre",
        price: "Free",
        rating: 4.8,
        students: 1240,
        image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80",
        tags: ["Science", "Grade 12"],
        category: "STEM",
        isPopular: true
    },
    {
        id: 102,
        name: "Chemistry - Organic",
        tutor: "Dr. Hana Mekonnen",
        price: "Premium",
        rating: 4.9,
        students: 852,
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
        tags: ["Science", "Grade 12"],
        category: "STEM",
        isPopular: false
    },
    {
        id: 103,
        name: "History - African Empires",
        tutor: "Mr. Solomon Girma",
        price: "Free",
        rating: 4.7,
        students: 2105,
        image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800&q=80",
        tags: ["Social", "Grade 9"],
        category: "Humanities",
        isPopular: true
    },
    {
        id: 104,
        name: "Amharic Grammar Mastery",
        tutor: "Ato Worku Belay",
        price: "Premium",
        rating: 4.6,
        students: 3400,
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
        tags: ["Language", "Grade 11"],
        category: "Language",
        isPopular: false
    },
]

export default function StudentCourses() {
    const [view, setView] = useState<"mine" | "catalog">("mine")
    const [activeCategory, setActiveCategory] = useState("All")
    const [enrollingId, setEnrollingId] = useState<number | null>(null)
    const { toast } = useToast()

    const handleContinue = (courseName: string) => {
        toast({
            title: "Resuming Course",
            description: `Redirecting you to ${courseName}...`,
            duration: 3000,
        })
    }

    const handleEnroll = (course: any) => {
        setEnrollingId(course.id)
        setTimeout(() => {
            setEnrollingId(null)
            toast({
                title: "Enrollment Successful!",
                description: `${course.name} has been added to your dashboard.`,
            })
        }, 1500)
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-2">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">Learning Center</span>
                            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
                            {view === "mine" ? "My Study <span className='text-sky-500'>Path</span>" : "Global <span className='text-indigo-500'>Catalog</span>"}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            {view === "mine"
                                ? "Accelerate your mastery. Pick up exactly where you left off."
                                : "Discover world-class curriculum designed for Ethiopian students."}
                        </p>
                    </div>

                    <div className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-[28px] border border-slate-200/50 shadow-inner">
                        <button
                            onClick={() => setView("mine")}
                            className={cn(
                                "flex items-center gap-2.5 px-8 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
                                view === "mine"
                                    ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <LayoutPanelLeft className="w-4.5 h-4.5" />
                            My Courses
                        </button>

                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 xl:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <Input
                            placeholder={view === "mine" ? "Search my history..." : "Find specialized prep..."}
                            className="bg-white/80 border-slate-200 text-slate-900 pl-12 h-14 rounded-[22px] focus:ring-sky-500/20 font-bold shadow-sm placeholder:text-slate-400"
                        />
                    </div>
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-600 h-14 px-6 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm gap-2">
                        <Filter className="w-4.5 h-4.5" />
                        Refine
                    </Button>
                </div>
            </div>

            {/* Catalog Discovery UI */}
            {view === "catalog" && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                    activeCategory === cat
                                        ? "bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-500/20"
                                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-6 p-10 rounded-[40px] bg-gradient-to-br from-indigo-600 to-sky-700 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30 group">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
                        <div className="relative z-10 max-w-lg">
                            <h3 className="text-2xl font-black tracking-tight mb-2">Personalized Recommendation</h3>
                            <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6 opacity-90">Based on your Grade 12 status, you might excel in the <span className="font-black text-white">Advanced Biology</span> track starting this month.</p>
                            <Button className="bg-white text-indigo-600 hover:bg-white/90 rounded-[18px] h-12 px-8 font-black text-xs uppercase tracking-widest gap-2 shadow-xl hover:-translate-y-0.5 transition-all">
                                View Recommended <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <GraduationCap className="absolute right-12 bottom-0 w-48 h-48 text-white/10 -rotate-12 translate-y-12" />
                    </div>
                </div>
            )}

            {/* Main Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {(view === "mine" ? MY_COURSES : CATALOG_COURSES).map((course) => (
                    <div key={course.id} className="group rounded-[40px] border border-slate-100 bg-white overflow-hidden hover:border-sky-200 transition-all duration-700 flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1">
                        <div className="h-56 relative overflow-hidden">
                            <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                {course.tags.map(tag => (
                                    <span key={tag} className="w-fit text-[9px] font-black text-slate-800 uppercase tracking-widest bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-xl border border-white/40">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {(course as any).isPopular && (
                                <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-white rounded-xl shadow-lg shadow-amber-500/20">
                                    <Star className="w-3 h-3 fill-white" />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Popular</span>
                                </div>
                            )}

                            <div className="absolute bottom-6 left-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                                        <PlayCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-sm">
                                        {view === "mine" ? "Active Study" : `${(course as any).rating} Instructor Rating`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug mb-1">{course.name}</h4>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{course.tutor}</p>
                            </div>

                            {view === "mine" ? (
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mastery Progress</p>
                                        <p className="text-xs font-black text-sky-600">{(course as any).progress}%</p>
                                    </div>
                                    <div className="relative h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div
                                            className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-sky-500/20"
                                            style={{ width: `${(course as any).progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic">
                                        <FileText className="w-3 h-3" />
                                        <span>Last focused {(course as any).lastAccessed}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 mb-8 py-6 border-y border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3 h-3" /> Enrollment</p>
                                        <p className="text-sm font-black text-slate-800">{(course as any).students.toLocaleString()}+</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Level</p>
                                        <p className={cn(
                                            "text-sm font-black",
                                            (course as any).price === "Free" ? "text-emerald-500" : "text-amber-500"
                                        )}>{(course as any).price}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-4">
                                <Button
                                    onClick={() => view === "mine" ? handleContinue(course.name) : handleEnroll(course)}
                                    disabled={enrollingId === course.id}
                                    className={cn(
                                        "w-full h-14 rounded-[22px] gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95",
                                        view === "mine"
                                            ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                                    )}
                                >
                                    {enrollingId === course.id ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Enrolling...
                                        </div>
                                    ) : (
                                        <>
                                            {view === "mine" ? <PlayCircle className="w-5 h-5 fill-white/10" /> : <CheckCircle className="w-5 h-5 fill-white/10" />}
                                            {view === "mine" ? "Resume Learning" : "Join this Track"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Discover Tool */}
                {view === "mine" && (
                    <div
                        onClick={() => setView("catalog")}
                        className="rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center p-12 gap-6 hover:bg-sky-50 hover:border-sky-400 transition-all duration-500 cursor-pointer group shadow-sm overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-sky-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-xl group-hover:shadow-sky-500/20">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-slate-800 font-black group-hover:text-sky-600 transition-colors uppercase tracking-widest text-sm">Expand Your Knowledge</h4>
                            <p className="text-slate-400 text-xs font-bold italic">Explore 50+ Specialized Paths</p>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 group-hover:bg-sky-100 transition-all duration-500">
                            <span className="text-[9px] font-black text-slate-500 group-hover:text-sky-600 uppercase tracking-widest">Open Catalog</span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function LayoutPanelLeft(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="7" height="18" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
        </svg>
    )
}
