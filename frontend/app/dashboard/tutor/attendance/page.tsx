"use client"

import { useState, useEffect } from "react"
import { courseApi, attendanceApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
    Users, 
    CalendarCheck, 
    ChevronLeft, 
    ChevronRight, 
    Search,
    BookOpen,
    Loader2,
    CheckCircle2,
    Clock,
    UserCircle2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ModernDataTable } from "@/components/dashboards/student/modern-data-table"

export default function TutorAttendance() {
    const { toast } = useToast()
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState("")
    const [attendance, setAttendance] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            setLoading(true)
            const res = await courseApi.getMyCourses()
            const tutorCourses = res.data || []
            setCourses(tutorCourses)
            if (tutorCourses.length > 0) {
                const firstId = tutorCourses[0]._id || tutorCourses[0].id
                setSelectedCourseId(firstId)
                loadAttendance(firstId)
            }
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to load courses", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const loadAttendance = async (courseId: string) => {
        try {
            setLoading(true)
            const res = await attendanceApi.getBySubject(courseId)
            setAttendance(res.data || [])
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to load attendance", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const filtered = attendance.filter(a => 
        a.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">Live Tracking</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Presence <span className='text-emerald-500'>Manager</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Monitor real-time student engagement and historical attendance patterns.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1 overflow-x-auto no-scrollbar max-w-full">
                            {courses.map((course) => (
                                <button
                                    key={course._id || course.id}
                                    onClick={() => {
                                        setSelectedCourseId(course._id || course.id)
                                        loadAttendance(course._id || course.id)
                                    }}
                                    className={cn(
                                        "h-12 px-6 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
                                        selectedCourseId === (course._id || course.id)
                                            ? "bg-white text-emerald-600 shadow-xl shadow-emerald-500/10 border border-emerald-100"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                    )}
                                >
                                    {course.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-[32px] border border-slate-200 shadow-xl">
                    <div className="flex items-center gap-3 px-6">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Present</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{attendance.length}</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <Button 
                        onClick={() => loadAttendance(selectedCourseId)}
                        className="h-12 w-12 rounded-2xl bg-slate-900 hover:bg-sky-600 text-white p-0 shadow-lg"
                    >
                        <Loader2 className={cn("w-5 h-5", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="relative z-10">
                <div className="mb-8 pl-6 border-l-4 border-emerald-500 flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Roster <span className="text-slate-400">Log</span></h3>
                        <p className="text-slate-500 text-sm font-medium">Students present in current/past sessions</p>
                    </div>
                    <div className="w-72 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search by student name..."
                            className="h-12 pl-11 rounded-2xl bg-white border-slate-100 font-bold text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading && attendance.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6" />
                        <h4 className="text-slate-900 font-black uppercase tracking-widest text-lg mb-2">Fetching Roster</h4>
                        <p className="text-slate-400 text-sm font-medium italic">Connecting to the live presence vault...</p>
                    </div>
                ) : attendance.length > 0 ? (
                    <ModernDataTable 
                        data={filtered}
                        columns={[
                            {
                                header: "Student",
                                accessorKey: "student.name",
                                cell: (row) => (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                                            {row.student?.profile?.avatar ? (
                                                <img src={row.student.profile.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle2 className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm italic">{row.student?.name || "Unknown Student"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 lowercase">{row.student?.email}</p>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                header: "Session ID",
                                accessorKey: "sessionId",
                                cell: (row) => (
                                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        {row.sessionId || "N/A"}
                                    </span>
                                )
                            },
                            {
                                header: "Timestamp",
                                accessorKey: "timestamp",
                                cell: (row) => (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="font-black text-slate-600 text-[11px] uppercase tracking-widest">
                                            {new Date(row.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                )
                            },
                            {
                                header: "Status",
                                accessorKey: "status",
                                className: "text-right",
                                cell: (row) => (
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Present
                                    </div>
                                )
                            }
                        ]}
                    />
                ) : (
                    <div className="py-32 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
                        <Users className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <h4 className="text-slate-900 font-black uppercase tracking-widest text-lg mb-2">No Attendance Yet</h4>
                        <p className="text-slate-400 text-sm font-medium italic">Student presence will appear here as they join live classes.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
