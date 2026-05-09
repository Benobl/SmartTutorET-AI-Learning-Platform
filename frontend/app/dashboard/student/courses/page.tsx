"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    BookOpen, Search, Filter, PlayCircle,
    LayoutGrid, List, Star, Users, CheckCircle,
    Sparkles, ChevronRight, GraduationCap, Video,
    MonitorPlay, Calendar, Zap, LayoutPanelLeft, Clock,
    SortAsc, SortDesc, ArrowUpDown, X, TrendingUp, FileDown, AlertCircle, ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { courseApi, paymentApi } from "@/lib/api"
import { exportToPDF } from "@/lib/manager-utils"
import { getCurrentUser } from "@/lib/auth-utils"

// ── Static Constants ──────────────────────────────────────────
const CATEGORIES = ["All", "Science", "Mathematics", "Humanities", "Language", "National Exam Prep"]
const GRADES = ["All Grades", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]
const SEMESTERS = ["All Semesters", "Semester 1", "Semester 2"]
const SORT_OPTIONS = [
    { value: "recent", label: "Recently Accessed" },
    { value: "progress", label: "Progress ↑" },
    { value: "progress_desc", label: "Progress ↓" },
    { value: "name_asc", label: "Name A–Z" },
    { value: "name_desc", label: "Name Z–A" },
    { value: "rating", label: "Highest Rated" },
]

// ── Mock Fallback Data ────────────────────────────────────────
const MY_COURSES = [
    {
        id: 1, name: "Mathematics - Calculus", tutor: "Dr. Kebede Kassaye",
        progress: 65, lessons: 24, completed: 15, lastAccessed: "2 hours ago",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        tags: ["Math", "Grade 12"], grade: "Grade 12", semester: "Semester 1",
        category: "Mathematics", delivery: "Live", nextClass: "Today, 4:00 PM", rating: 4.9,
    },
    {
        id: 2, name: "Physics - Mechanics", tutor: "Prof. Liya Tekle",
        progress: 32, lessons: 18, completed: 6, lastAccessed: "Yesterday",
        image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
        tags: ["Science", "Grade 11"], grade: "Grade 11", semester: "Semester 2",
        category: "Science", delivery: "Recorded", nextClass: "Self-paced", rating: 4.7,
    },
    {
        id: 3, name: "English Literature", tutor: "Ms. Bethlehem Assefa",
        progress: 89, lessons: 12, completed: 11, lastAccessed: "3 days ago",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
        tags: ["English", "Grade 10"], grade: "Grade 10", semester: "Semester 1",
        category: "Humanities", delivery: "Live", nextClass: "Tomorrow, 10:00 AM", rating: 4.8,
    },
    {
        id: 4, name: "Biology - Cell Division", tutor: "Dr. Aster Gebre",
        progress: 15, lessons: 20, completed: 3, lastAccessed: "Last week",
        image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80",
        tags: ["Science", "Grade 9"], grade: "Grade 9", semester: "Semester 2",
        category: "Science", delivery: "Recorded", nextClass: "Self-paced", rating: 4.6,
    },
]

const CATALOG_COURSES = [
    {
        id: 101, name: "Biology - Genetics", tutor: "Dr. Aster Gebre",
        price: "Free", rating: 4.8, students: 1240,
        image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80",
        tags: ["Science", "Grade 12"], grade: "Grade 12", semester: "Semester 1",
        category: "Science", isPopular: true, delivery: "Live",
    },
    {
        id: 102, name: "Chemistry - Organic", tutor: "Dr. Hana Mekonnen",
        price: "Premium", rating: 4.9, students: 852,
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
        tags: ["Science", "Grade 12"], grade: "Grade 12", semester: "Semester 2",
        category: "Science", isPopular: false, delivery: "Recorded",
    },
    {
        id: 103, name: "History - African Empires", tutor: "Mr. Solomon Girma",
        price: "Free", rating: 4.7, students: 2105,
        image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800&q=80",
        tags: ["Social", "Grade 9"], grade: "Grade 9", semester: "Semester 1",
        category: "Humanities", isPopular: true, delivery: "Live",
    },
    {
        id: 104, name: "Amharic Grammar Mastery", tutor: "Ato Worku Belay",
        price: "Premium", rating: 4.6, students: 3400,
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
        tags: ["Language", "Grade 11"], grade: "Grade 11", semester: "Semester 2",
        category: "Language", isPopular: false, delivery: "Recorded",
    },
    {
        id: 105, name: "Mathematics - Vectors & 3D", tutor: "Mr. Dawit Isaac",
        price: "Free", rating: 4.9, students: 870,
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        tags: ["Math", "Grade 11"], grade: "Grade 11", semester: "Semester 1",
        category: "Mathematics", isPopular: true, delivery: "Live",
    },
    {
        id: 106, name: "National Exam Prep - Math", tutor: "Dr. Kebede Kassaye",
        price: "Premium", rating: 5.0, students: 5200,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        tags: ["Exam Prep", "Grade 12"], grade: "Grade 12", semester: "Semester 2",
        category: "National Exam Prep", isPopular: true, delivery: "Recorded",
    },
]

// ── Main Component ────────────────────────────────────────────
export default function StudentCourses() {
    const router = useRouter()
    const currentUser = getCurrentUser()
    const initialGrade = currentUser?.grade ? `Grade ${currentUser.grade}` : "All Grades"

    const [activeTab, setActiveTab] = useState<"enrolled" | "catalog">("enrolled")
    const [activeCategory, setActiveCategory] = useState("All")
    const [activeGrade, setActiveGrade] = useState(initialGrade)
    const [isVerifying, setIsVerifying] = useState(false)
    const [activeSemester, setActiveSemester] = useState("All Semesters")
    const [sortBy, setSortBy] = useState("recent")
    const [searchQuery, setSearchQuery] = useState("")
    const [enrollingId, setEnrollingId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [myCourses, setMyCourses] = useState<any[]>([])
    const [catalogCourses, setCatalogCourses] = useState<any[]>([])
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [showSortMenu, setShowSortMenu] = useState(false)
    const { toast } = useToast()

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [all, mine, recs] = await Promise.allSettled([
                courseApi.getAll(),
                courseApi.getMyCourses(),
                courseApi.getRecommendations()
            ])
            
            if (all.status === "fulfilled" && all.value.success) {
                setCatalogCourses(all.value.data.map((c: any) => ({
                    id: c._id || c.id, name: c.title, tutor: c.tutor?.name || "Expert Tutor",
                    price: c.price === 0 ? "Free" : `${c.price} ETB`, rating: 4.8,
                    students: c.students?.length || 0,
                    image: c.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
                    tags: [c.category || "General", `Grade ${c.grade || 12}`],
                    grade: `Grade ${c.grade || 12}`, semester: c.semester || "Semester 1",
                    category: c.category || "All", delivery: "Live",
                    isPopular: (c.students?.length || 0) > 10,
                })))
            } else { setCatalogCourses(CATALOG_COURSES) }

            if (mine.status === "fulfilled" && mine.value.success) {
                setMyCourses(mine.value.data.map((c: any) => ({
                    id: c._id || c.id, 
                    name: c.title, 
                    tutor: c.tutor?.name || "Expert Tutor",
                    progress: Math.floor(Math.random() * 60),
                    lessons: c.lessons?.length || 0, 
                    completed: 0, 
                    lastAccessed: "Recently",
                    image: c.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
                    tags: [c.category || "General", `Grade ${c.grade || 12}`],
                    grade: `Grade ${c.grade || 12}`, 
                    semester: c.semester || "Semester 1",
                    category: c.category || "All", 
                    delivery: "Live",
                    nextClass: "Available now", 
                    rating: 4.8,
                    hasLessons: c.lessons && c.lessons.length > 0
                })))
            } else { setMyCourses(MY_COURSES) }

            if (recs.status === "fulfilled" && recs.value.success) {
                setRecommendations(recs.value.data.map((c: any) => ({
                    id: c._id || c.id, name: c.title, tutor: c.tutor?.name || "Expert Tutor",
                    price: c.price === 0 ? "Free" : "Premium", rating: 4.9,
                    students: c.students?.length || 0,
                    image: c.thumbnail || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
                    tags: [c.category || "General", `Grade ${c.grade || 12}`],
                    grade: `Grade ${c.grade || 12}`,
                })))
            }
        } catch (error) {
            console.error("[StudentCourses] Load Error:", error)
            setCatalogCourses(CATALOG_COURSES)
            setMyCourses(MY_COURSES)
        } finally { setIsLoading(false) }
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        const txRef = urlParams.get('tx_ref');
        
        if (txRef) {
            const verifyPayment = async () => {
                setIsVerifying(true);
                try {
                    await paymentApi.verify(txRef);
                    toast({
                        title: "Payment Successful",
                        description: "You have been successfully enrolled in the course.",
                    });
                    // Clear query params
                    if (typeof window !== "undefined") {
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                    loadData();
                } catch (error: any) {
                    toast({
                        title: "Verification Failed",
                        description: error.message || "Could not verify your payment.",
                        variant: "destructive"
                    });
                } finally {
                    setIsVerifying(false);
                }
            };
            verifyPayment();
        }
    }, []);

    // ── Filter & Sort Logic ─────────────────────────────────
    const filteredCourses = useMemo(() => {
        const source = activeTab === "enrolled" ? myCourses : catalogCourses
        let result = source.filter(course => {
            const q = searchQuery.toLowerCase()
            const matchesSearch = !q || course.name.toLowerCase().includes(q) || course.tutor.toLowerCase().includes(q)
            const matchesCategory = activeCategory === "All" || course.category === activeCategory || course.tags.some((t: string) => t.includes(activeCategory))
            const matchesGrade = activeGrade === "All Grades" || course.grade === activeGrade || course.tags.some((t: string) => t.includes(activeGrade.replace("Grade ", "")))
            const matchesSemester = activeSemester === "All Semesters" || course.semester === activeSemester
            return matchesSearch && matchesCategory && matchesGrade && matchesSemester
        })

        // Sort
        switch (sortBy) {
            case "progress": result = [...result].sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0)); break
            case "progress_desc": result = [...result].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0)); break
            case "name_asc": result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break
            case "name_desc": result = [...result].sort((a, b) => b.name.localeCompare(a.name)); break
            case "rating": result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
            default: break // "recent" keeps original order
        }
        return result
    }, [activeTab, myCourses, catalogCourses, searchQuery, activeCategory, activeGrade, activeSemester, sortBy])

    const hasActiveFilters = activeCategory !== "All" || activeGrade !== "All Grades" || activeSemester !== "All Semesters" || searchQuery !== ""

    const resetFilters = () => {
        setActiveCategory("All"); setActiveGrade("All Grades")
        setActiveSemester("All Semesters"); setSearchQuery("")
    }

    const handleContinue = (courseId: string | number, courseName: string) => {
        toast({ title: "Resuming Course", description: `Redirecting to ${courseName}...`, duration: 2000 })
        router.push(`/dashboard/student/courses/${courseId}`)
    }

    const handleEnroll = async (course: any) => {
        if (course.price !== "Free") {
            try {
                setEnrollingId(course.id)
                // First, verify if already paid/enrolled via the backend
                const enrollmentCheck = await paymentApi.checkEnrollment(course.id);
                if (enrollmentCheck.data?.alreadyPaid) {
                    toast({
                        title: "Already Enrolled",
                        description: "You already have access to this course!",
                        className: "bg-emerald-500 text-white"
                    });
                    router.push(`/dashboard/student/courses/${course.id}`);
                    return;
                }

                const amountStr = course.price.replace(" ETB", "")
                const amount = parseFloat(amountStr)
                
                const response = await paymentApi.initialize({
                    amount,
                    subjectId: course.id,
                    method: "chapa"
                })
                
                if (response.success && response.data.checkout_url) {
                    toast({ title: "Redirecting", description: "Opening Chapa payment gateway..." })
                    window.location.href = response.data.checkout_url
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
                setEnrollingId(null)
            }
            return
        }
        setEnrollingId(course.id)
        try {
            await courseApi.enroll(course.id)
            toast({ title: "Enrollment Successful!", description: `${course.name} added to your dashboard.` })
            setMyCourses(prev => [...prev, { ...course, progress: 0, lastAccessed: "Just now", nextClass: "Available now" }])
            setCatalogCourses(prev => prev.filter(c => c.id !== course.id))
        } catch (error: any) {
            toast({ title: "Enrollment Failed", description: error.message || "Please try again.", variant: "destructive" })
        } finally { setEnrollingId(null) }
    }

    const handleExportCatalog = () => {
        const columns = ['name', 'tutor', 'grade', 'price', 'category', 'delivery']
        exportToPDF(catalogCourses, columns, 'SmartTutorET: Institutional Course Catalog', 'course_catalog_report')
        toast({ title: "Processing Report", description: "Your curriculum catalog is being prepared as a PDF." })
    }

    const activeSortLabel = SORT_OPTIONS.find(s => s.value === sortBy)?.label ?? "Sort By"

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">

            {/* ── Page Header ── */}
            <div className="flex flex-col gap-6 pb-4 border-b border-slate-100">

                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                    {/* Title */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Learning Center</span>
                            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
                            {activeTab === "enrolled"
                                ? <><span className="text-sky-500">Enrolled</span> Courses</>
                                : <>Browse <span className="text-indigo-500">Catalog</ span></>
                            }
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            {activeTab === "enrolled"
                                ? `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} in your curriculum`
                                : "Discover specialized courses from the best tutors in Ethiopia."}
                        </p>
                    </div>

                    {activeTab === "catalog" && (
                        <Button
                            variant="outline"
                            onClick={handleExportCatalog}
                            className="bg-white/80 backdrop-blur-md border-slate-200 text-slate-600 rounded-2xl gap-3 font-black px-6 h-12 text-[10px] uppercase tracking-widest transition-all shadow-sm group"
                        >
                            <FileDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform text-indigo-500" />
                            Download Full Catalog
                        </Button>
                    )}

                    {/* Tab Switcher */}
                    <div className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-[28px] border border-slate-200/50 shadow-inner shrink-0">
                        {[
                            { id: "enrolled", label: "My Enrolled", icon: LayoutPanelLeft },
                            { id: "catalog", label: "Browse Catalog", icon: LayoutGrid }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as any); resetFilters() }}
                                className={cn(
                                    "flex items-center gap-2.5 px-8 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id
                                        ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Search + Sort Row ── */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={activeTab === "enrolled" ? "Search enrolled courses or tutor..." : "Find any subject, tutor..."}
                            className="bg-white border-slate-200 text-slate-900 pl-11 pr-10 h-14 rounded-[22px] focus:ring-sky-500/20 font-bold shadow-sm placeholder:text-slate-400 w-full"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setShowSortMenu(v => !v)}
                            className="h-14 px-6 rounded-[22px] bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm flex items-center gap-2.5 transition-all"
                        >
                            <ArrowUpDown className="w-4 h-4 text-slate-400" />
                            {activeSortLabel}
                        </button>
                        {showSortMenu && (
                            <div className="absolute right-0 top-16 z-50 bg-white border border-slate-100 rounded-[24px] shadow-2xl shadow-slate-200/60 p-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                                        className={cn(
                                            "w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                            sortBy === opt.value ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters removed for a cleaner interface */}
            </div>

            {/* ── Main Course Grid ── */}
            {isVerifying && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest animate-pulse">Verifying Transaction...</p>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="rounded-[40px] border border-slate-100 bg-white p-8 space-y-6 shadow-sm">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-3/4 rounded-lg" />
                                <Skeleton className="h-4 w-1/2 rounded-lg" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-2xl" />
                        </div>
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                        <Search className="w-10 h-10 text-slate-200" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">No Matches Found</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                    <Button variant="ghost" onClick={resetFilters} className="text-sky-600 font-black text-xs uppercase tracking-widest hover:bg-sky-50">
                        Reset All Filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCourses.map(course => {
                        const isEnrolled = activeTab === "enrolled" || myCourses.some(c => c.id === course.id);
                        return (
                            <CourseCard
                                key={course.id}
                                course={{...course, isEnrolled}}
                                tab={activeTab}
                                enrollingId={enrollingId}
                                onContinue={handleContinue}
                                onEnroll={handleEnroll}
                            />
                        )
                    })}

                    {/* Discover Card (in enrolled tab) */}
                    {activeTab === "enrolled" && (
                        <div
                            onClick={() => setActiveTab("catalog")}
                            className="rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center p-12 gap-6 hover:bg-sky-50 hover:border-sky-300 transition-all duration-500 cursor-pointer group"
                        >
                            <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-sky-500 group-hover:scale-110 transition-all duration-500 shadow-xl">
                                <BookOpen className="w-10 h-10" />
                            </div>
                            <div className="text-center space-y-1">
                                <h4 className="text-slate-800 font-black group-hover:text-sky-600 transition-colors uppercase tracking-widest text-sm">Expand Your Knowledge</h4>
                                <p className="text-slate-400 text-xs font-bold italic">Explore 100+ Prep Tracks</p>
                            </div>
                            <span className="flex items-center gap-2 text-[9px] font-black text-slate-500 group-hover:text-sky-600 uppercase tracking-widest px-5 py-2 rounded-full bg-white shadow-sm">
                                Open Catalog <ChevronRight className="w-3 h-3" />
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Filter Badge ─────────────────────────────────────────────
function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">
            {label}
            <button onClick={onRemove} className="text-sky-400 hover:text-rose-500 transition-colors">
                <X className="w-3 h-3" />
            </button>
        </span>
    )
}

// ── Course Card Component ─────────────────────────────────────
function CourseCard({ course, tab, enrollingId, onContinue, onEnroll }: {
    course: any
    tab: "enrolled" | "catalog"
    enrollingId: string | null
    onContinue: (id: string | number, name: string) => void
    onEnroll: (course: any) => void
}) {
    const isEnrolled = course.isEnrolled || false; // Backend can flag this

    return (
        <div className="group rounded-[40px] border border-slate-100 bg-white overflow-hidden hover:border-sky-200 transition-all duration-700 flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1 p-8">
            {/* Header Badges */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                    <span className={cn(
                        "w-fit text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-sm",
                        course.delivery === "Live"
                            ? "bg-rose-50 text-rose-500 border-rose-100"
                            : "bg-sky-50 text-sky-600 border-sky-100"
                    )}>
                        {course.delivery === "Live" ? <Video className="w-3 h-3" /> : <MonitorPlay className="w-3 h-3" />}
                        {course.delivery} Class
                    </span>
                    <div className="flex gap-2">
                        <span className="w-fit text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            {course.grade}
                        </span>
                        <span className="w-fit text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            {course.semester}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-700">{course.rating?.toFixed(1) || "4.8"}</span>
                    </div>
                    {tab === "catalog" && course.isPopular && (
                        <span className="w-fit text-[9px] font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-2.5 py-1 rounded-xl shadow-sm border border-amber-200 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Popular
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="mb-5 min-w-0">
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug mb-1">{course.name}</h4>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">{course.tutor}</p>
                </div>

                {/* Enrolled: Progress */}
                {tab === "enrolled" ? (
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-sky-500 fill-sky-500" /> Course Progress
                            </span>
                            <span className="text-xs font-black text-sky-600">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                            <div 
                                className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(14,165,233,0.3)]" 
                                style={{ width: `${course.progress}%` }} 
                            />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {course.nextClass}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.completed}/{course.lessons} Done</span>
                        </div>
                    </div>
                ) : (
                    /* Catalog: Stats */
                    <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-slate-50">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> Students</p>
                            <p className="text-sm font-black text-slate-800">{course.students?.toLocaleString()}+</p>
                        </div>
                        <div className="text-right space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access</p>
                            <p className={cn("text-sm font-black", course.price === "Free" ? "text-emerald-500" : "text-amber-500")}>{course.price}</p>
                        </div>
                    </div>
                )}

                <div className="mt-auto">
                    {tab === "enrolled" && !course.hasLessons && (
                        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col gap-2">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" /> No Lessons Uploaded Yet
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 leading-tight">
                                Your tutor hasn't uploaded content for this course. Start learning from official Ethiopian Ministry of Education resources.
                            </p>
                            <a 
                                href="https://learn-english.moe.gov.et/?utm_source=chatgpt.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-2 w-full py-2.5 rounded-xl bg-white border border-amber-200 text-amber-600 text-[10px] font-black uppercase tracking-widest text-center hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                            >
                                Open MoE English Portal
                            </a>
                        </div>
                    )}

                    <Button
                        onClick={() => {
                            if (tab === "enrolled" || isEnrolled) {
                                onContinue(course.id, course.name)
                            } else {
                                onEnroll(course)
                            }
                        }}
                        disabled={enrollingId === course.id || (tab === "enrolled" && !course.hasLessons)}
                        className={cn(
                            "w-full h-14 rounded-[22px] gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95",
                            (tab === "enrolled" || isEnrolled)
                                ? (course.hasLessons || tab === "catalog")
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-600 shadow-none"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                : course.price === "Free"
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                        )}
                    >
                        {enrollingId === course.id ? (
                            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Syncing...</span>
                        ) : tab === "enrolled" ? (
                            course.hasLessons 
                                ? <><PlayCircle className="w-5 h-5 fill-white/20" /> Continue Learning</>
                                : <><Clock className="w-5 h-5" /> Waiting for Tutor</>
                        ) : isEnrolled ? (
                            <>Already Enrolled <ArrowRight className="w-4 h-4" /></>
                        ) : course.price === "Free" ? (
                            <><CheckCircle className="w-5 h-5" /> Enroll for Free</>
                        ) : (
                            <><Star className="w-5 h-5 fill-white/20" /> Enroll for Premium</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
