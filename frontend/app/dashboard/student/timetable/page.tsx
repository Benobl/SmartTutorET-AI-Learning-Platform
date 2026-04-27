"use client"

import { timetable as initialTimetable, type TimetableSlot } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { CalendarDays, Clock, MapPin, User, GraduationCap, LayoutPanelLeft, ListChecks, Plus, X, Brain, Sparkles, Download, ArrowUpRight, Activity, Book, PenTool, SearchCode, History, CheckCircle, Video } from "lucide-react"
import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

/**
 * Weekly Timetable page — now featuring a "Personal Study Scheduler"
 * that allows students to plan their own reading sessions in empty slots.
 */
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    StreamCall,
    StreamVideo,
    Call,
    CallingState,
    StreamTheme
} from "@stream-io/video-react-sdk"
import { useStream } from "@/components/providers/StreamProvider"
import { LiveClassroom } from "@/components/dashboard/stream/LiveClassroom"
import { PermissionRecoveryModal } from "@/components/dashboard/stream/PermissionRecoveryModal"
import { getCurrentUser } from "@/lib/auth-utils"




const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]

const getCurrentDay = () => {
    const dayIndex = new Date().getDay()
    const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return dayMap[dayIndex]
}

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string; glow: string }> = {
    sky: { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-600", dot: "bg-sky-500", glow: "shadow-sky-500/20" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", dot: "bg-emerald-500", glow: "shadow-emerald-500/20" },
    amber: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", dot: "bg-amber-500", glow: "shadow-amber-500/20" },
    violet: { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-600", dot: "bg-violet-500", glow: "shadow-violet-500/20" },
    rose: { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-600", dot: "bg-rose-500", glow: "shadow-rose-500/20" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600", dot: "bg-indigo-500", glow: "shadow-indigo-500/20" },
}

function SlotCard({ slot, isStudy = false, onJoin, onDelete }: {
    slot: TimetableSlot; isStudy?: boolean; onJoin?: () => void; onDelete?: () => void
}) {
    const colors = colorMap[slot.color] || colorMap.sky

    // Category icons for study sessions
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Reading": return <Book className="w-4 h-4" />
            case "Homework": return <PenTool className="w-4 h-4" />
            case "Question Practice": return <SearchCode className="w-4 h-4" />
            case "Review": return <History className="w-4 h-4" />
            default: return <Brain className="w-4 h-4" />
        }
    }

    return (
        <div className={cn(
            "group/slot relative p-6 rounded-[32px] border transition-all hover:scale-[1.02] cursor-pointer shadow-sm overflow-hidden",
            isStudy
                ? "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 group/study"
                : cn(colors.bg, colors.border)
        )}>
            {isStudy && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 blur-3xl rounded-full -mr-10 -mt-10 group-hover/study:scale-150 transition-transform duration-700" />
            )}

            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex items-start gap-3.5">
                    <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-all",
                        isStudy
                            ? "bg-indigo-50 border-indigo-100 text-indigo-500 group-hover/study:bg-indigo-500 group-hover/study:text-white"
                            : cn("bg-white text-slate-900 border-white/50", colors.text)
                    )}>
                        {isStudy ? getCategoryIcon(slot.room) : <GraduationCap className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className={cn("text-[14px] font-black leading-tight uppercase tracking-tight", isStudy ? "text-indigo-600" : "text-slate-900")}>
                            {slot.course}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-black mt-1 uppercase tracking-widest flex items-center gap-1.5">
                            {isStudy ? (
                                <>
                                    <Sparkles className="w-3 h-3 text-indigo-400" />
                                    {slot.room}
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-3 h-3" />
                                    {slot.room}
                                </>
                            )}
                        </p>
                    </div>
                </div>
                {isStudy && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                        className="opacity-0 group-hover/slot:opacity-100 p-2 rounded-xl hover:bg-red-50 text-red-400 transition-all border border-transparent hover:border-red-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-indigo-200" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">
                        {isStudy ? "Self Guided" : slot.tutor}
                    </p>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[10px] tracking-tight",
                    isStudy ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-white/40 border-white/60 text-slate-600"
                )}>
                    <Clock className="w-3.5 h-3.5" />
                    {slot.startTime} - {slot.endTime}
                </div>
            </div>

            {/* Join Button for Academic Classes */}
            {!isStudy && (
                <div className="mt-5 pt-5 border-t border-white/40 flex justify-end relative z-10">
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onJoin?.() }}
                        className="h-9 px-5 rounded-xl bg-white text-slate-900 border border-slate-100 hover:bg-slate-900 hover:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-sm transition-all"
                    >
                        <Video className="w-4 h-4" /> Join Live
                    </Button>
                </div>
            )}
        </div>
    )
}



export default function StudentTimetable() {
    const currentDay = getCurrentDay()
    const { toast } = useToast()
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"class" | "study">("class")
    const [studySlots, setStudySlots] = useState<TimetableSlot[]>([])
    const [isStudyModalOpen, setIsStudyModalOpen] = useState(false)
    const [pendingStudy, setPendingStudy] = useState<{ day: string; time: string } | null>(null)
    const [studyDetails, setStudyDetails] = useState({ title: "", category: "Reading", startTime: "", endTime: "" })

    const [activeCall, setActiveCall] = useState<Call | null>(null)
    const [activeSlot, setActiveSlot] = useState<TimetableSlot | null>(null)
    const [isJoining, setIsJoining] = useState(false)
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
    const { videoClient, isReady: isStreamReady } = useStream()
    const currentUser = getCurrentUser()



    // Combine class schedule with personal study plan
    const fullSchedule = useMemo(() => {
        return [...initialTimetable, ...studySlots]
    }, [studySlots])

    const byDay: Record<string, TimetableSlot[]> = {}
    DAYS.forEach((d) => { byDay[d] = [] })
    fullSchedule.forEach((slot) => { byDay[slot.day]?.push(slot) })

    const handleAddStudyTrigger = (day: string, time: string) => {
        if (viewMode !== "study") return

        const existing = fullSchedule.find(s => s.day === day && s.startTime === time)
        if (existing) {
            toast({
                title: "Slot Occupied",
                description: `You already have ${existing.course} at this time.`,
                variant: "destructive"
            })
            return
        }

        setPendingStudy({ day, time })
        setStudyDetails({
            ...studyDetails,
            startTime: time,
            endTime: `${parseInt(time.split(":")[0]) + 1}:00`
        })
        setIsStudyModalOpen(true)
    }

    const confirmAddStudy = () => {
        if (!pendingStudy || !studyDetails.title || !studyDetails.startTime || !studyDetails.endTime) return

        const newSlot: TimetableSlot = {
            id: `study-${Date.now()}`,
            course: studyDetails.title,
            code: studyDetails.category === "Homework" ? "HW-PRO" : "ST-001",
            startTime: studyDetails.startTime,
            endTime: studyDetails.endTime,
            day: pendingStudy.day,
            room: studyDetails.category,
            tutor: "Self Guided",
            color: "indigo"
        }

        setStudySlots(prev => [...prev, newSlot])
        setIsStudyModalOpen(false)
        setStudyDetails({ title: "", category: "Reading", startTime: "", endTime: "" })


        toast({
            title: "Study Block Created",
            description: `Scheduled: ${studyDetails.title} on ${pendingStudy.day}.`,
        })
    }

    const handleDeleteStudy = (id: string) => {
        setStudySlots(prev => prev.filter(s => s.id !== id))
        toast({
            title: "Session Removed",
            description: "Study block has been cleared."
        })
    }

    const handleJoinClass = async (slot: TimetableSlot) => {
        if (!currentUser || !videoClient) return
        setIsJoining(true)
        // Stable ID for the class so all students land in the same room
        const callId = `class-${slot.code.replace(/[^a-zA-Z0-9_-]/g, '-')}`
        const call = videoClient.call('default', callId)
        try {
            await call.getOrCreate({
                data: {
                    members: [{ user_id: currentUser._id || currentUser.id || "guest", role: 'admin' }],
                    custom: { courseName: slot.course, tutorName: slot.tutor }
                }
            })
            setActiveCall(call)
            setActiveSlot(slot)
        } catch (e) {
            console.error("Failed to join class:", e)
            toast({ title: "Class Unavailable", variant: "destructive" })
        } finally {
            setIsJoining(false)
        }
    }

    const handleLeaveClass = async () => {
        if (!activeCall) return
        const callToLeave = activeCall
        setActiveCall(null)
        setActiveSlot(null)
        try {
            const s = callToLeave.state.callingState
            if (s !== CallingState.LEFT && s !== CallingState.UNKNOWN) {
                await callToLeave.leave()
            }
        } catch (e) { console.error("Error leaving class:", e) }
    }


    if (activeCall && activeSlot) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950">
                <LiveClassroom
                    call={activeCall}
                    squadName={activeSlot.course}
                    squadId={activeSlot.id}
                    onLeave={handleLeaveClass}
                />
                <PermissionRecoveryModal open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen} />
            </div>
        )
    }


    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header & Filter Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Academic Manager</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            My <span className='text-sky-500'>Agenda</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Coordinate your classes and personal study flow with precision.
                        </p>
                    </div>

                    <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1 w-fit">
                        <button
                            onClick={() => setViewMode("class")}
                            className={cn(
                                "h-12 px-10 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5",
                                viewMode === "class"
                                    ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Class Schedule
                        </button>
                        <button
                            onClick={() => setViewMode("study")}
                            className={cn(
                                "h-12 px-10 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5",
                                viewMode === "study"
                                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Brain className="w-4 h-4" />
                            Study Planner
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button className="h-16 px-10 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform">
                        <Download className="w-5 h-5 text-sky-400" />
                        Export Agenda
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex gap-3 overflow-x-auto pb-6 lg:hidden no-scrollbar">
                {DAYS.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                            "px-8 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                            (selectedDay || currentDay) === day
                                ? "bg-sky-500 text-white border-sky-400 shadow-xl shadow-sky-500/30"
                                : "bg-white text-slate-400 border-slate-100"
                        )}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden lg:block rounded-[56px] bg-white border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/10">
                <div className="grid grid-cols-[140px_repeat(6,1fr)] bg-slate-50 border-b border-slate-100">
                    <div className="p-10" />
                    {DAYS.map((day) => (
                        <div key={day} className={cn("p-10 text-center border-l border-slate-100 relative group", day === currentDay && "bg-sky-50/50")}>
                            {day === currentDay && <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500" />}
                            <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", day === currentDay ? "text-sky-600" : "text-slate-400")}>{day.slice(0, 3)}</p>
                            <p className={cn("text-lg font-black tracking-tight", day === currentDay ? "text-slate-900" : "text-slate-200 group-hover:text-slate-300 transition-colors")}>{day}</p>
                        </div>
                    ))}
                </div>

                {TIME_SLOTS.map((time) => (
                    <div key={time} className="grid grid-cols-[140px_repeat(6,1fr)] border-b border-slate-100 last:border-0 hover:bg-slate-50/20 transition-colors group/row">
                        <div className="p-8 flex items-center justify-center border-r border-slate-50">
                            <span className="text-[11px] text-slate-400 font-black tracking-tighter bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm group-hover/row:border-sky-200 transition-colors">{time}</span>
                        </div>
                        {DAYS.map((day) => {
                            const slot = byDay[day]?.find((s) => s.startTime === time)
                            const isStudy = slot?.id.toString().startsWith("study")

                            return (
                                <div
                                    key={`${day}-${time}`}
                                    onClick={() => handleAddStudyTrigger(day, time)}
                                    className={cn(
                                        "p-4 border-l border-slate-50 min-h-[160px] transition-all relative overflow-hidden cursor-default",
                                        viewMode === "study" && !slot && "hover:bg-indigo-50/40 group/slot-empty cursor-pointer active:scale-95",
                                        day === currentDay && "bg-sky-50/10"
                                    )}
                                >

                                    {slot ? (
                                        <SlotCard
                                            slot={slot}
                                            isStudy={isStudy}
                                            onJoin={() => handleJoinClass(slot)}
                                            onDelete={() => handleDeleteStudy(slot.id.toString())}
                                        />
                                    ) : viewMode === "study" && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot-empty:opacity-100 transition-opacity">
                                            <div className="flex flex-col items-center gap-2 border-2 border-dashed border-indigo-200 bg-white/60 backdrop-blur-md px-6 py-4 rounded-[32px] shadow-2xl shadow-indigo-500/10 scale-90 group-hover/slot-empty:scale-100 transition-transform">
                                                <Plus className="w-6 h-6 text-indigo-500" />
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Schedule Study</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-6">
                {(() => {
                    const day = selectedDay || currentDay
                    const daySlots = byDay[day] || []
                    return daySlots.length > 0 ? (
                        daySlots.map(s => (
                            <SlotCard
                                key={s.id}
                                slot={s}
                                isStudy={s.id.toString().startsWith("study")}
                                onJoin={() => handleJoinClass(s)}
                                onDelete={() => handleDeleteStudy(s.id.toString())}
                            />
                        ))
                    ) : (
                        <div className="py-24 text-center bg-white rounded-[56px] border border-dashed border-slate-200 shadow-sm">
                            <LayoutPanelLeft className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                            <h4 className="text-slate-900 font-black uppercase tracking-widest text-lg mb-2 tracking-tight">Agenda Crystal Clear</h4>
                            <p className="text-slate-400 text-sm font-medium italic max-w-xs mx-auto">Your schedule for {day} is currently empty. Perfect time for some self-study!</p>
                        </div>
                    )
                })()}
            </div>

            {/* Footer Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="p-10 rounded-[56px] bg-slate-900 text-white relative overflow-hidden shadow-2xl group">
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                                <Activity className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black tracking-tight mb-1">Schedule Fidelity</h4>
                                <p className="text-indigo-200/60 text-[10px] font-black uppercase tracking-widest">98.4% Attendance Accuracy</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <ArrowUpRight className="w-10 h-10 text-indigo-500 mb-2" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Optimal Performance</span>
                        </div>
                    </div>
                </div>

                <div className="p-10 rounded-[56px] bg-white border border-slate-100 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Settings</h4>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3 group cursor-help">
                                <div className="w-6 h-6 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Academic</span>
                            </div>
                            <div className="flex items-center gap-3 group cursor-help">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/40 border border-white/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Personal Study</span>
                            </div>
                        </div>
                        <Button variant="ghost" className="rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50">
                            Reset All Sessions
                        </Button>
                    </div>
                </div>
            </div>
            {/* Study Planner Creation Modal - Refined White Theme */}
            <Dialog open={isStudyModalOpen} onOpenChange={setIsStudyModalOpen}>
                <DialogContent className="max-w-md rounded-[40px] border-slate-100 shadow-2xl p-0 overflow-hidden bg-white">
                    <div className="bg-white p-10 border-b border-slate-50 relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-50 blur-3xl rounded-full opacity-50" />
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                    <Brain className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">Create Session</DialogTitle>
                                    <p className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mt-0.5">{pendingStudy?.day} Plan</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session Goal</Label>
                            <Input
                                placeholder="e.g. Solve Physics Problems"
                                className="h-14 rounded-2xl border-slate-100 font-black text-sm bg-slate-50 focus:bg-white focus:ring-0 focus:border-indigo-200 transition-all px-6"
                                value={studyDetails.title}
                                onChange={(e) => setStudyDetails({ ...studyDetails, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Time</Label>
                                <Input
                                    type="time"
                                    className="h-14 rounded-2xl border-slate-100 font-black text-sm bg-slate-50 focus:bg-white transition-all px-6"
                                    value={studyDetails.startTime}
                                    onChange={(e) => setStudyDetails({ ...studyDetails, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Time</Label>
                                <Input
                                    type="time"
                                    className="h-14 rounded-2xl border-slate-100 font-black text-sm bg-slate-50 focus:bg-white transition-all px-6"
                                    value={studyDetails.endTime}
                                    onChange={(e) => setStudyDetails({ ...studyDetails, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Activity Category</Label>
                            <Select
                                value={studyDetails.category}
                                onValueChange={(v) => setStudyDetails({ ...studyDetails, category: v })}
                            >
                                <SelectTrigger className="h-14 rounded-2xl border-slate-100 font-black text-sm bg-slate-50 focus:bg-white transition-all px-6">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-3xl border-slate-100 shadow-2xl p-2">
                                    <SelectItem value="Reading" className="font-black text-xs uppercase tracking-widest py-3 rounded-xl focus:bg-indigo-50 focus:text-indigo-600">Reading Session</SelectItem>
                                    <SelectItem value="Homework" className="font-black text-xs uppercase tracking-widest py-3 rounded-xl focus:bg-indigo-50 focus:text-indigo-600">Do Homework</SelectItem>
                                    <SelectItem value="Question Practice" className="font-black text-xs uppercase tracking-widest py-3 rounded-xl focus:bg-indigo-50 focus:text-indigo-600">Question Practice</SelectItem>
                                    <SelectItem value="Review" className="font-black text-xs uppercase tracking-widest py-3 rounded-xl focus:bg-indigo-50 focus:text-indigo-600">Exam Review</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsStudyModalOpen(false)}
                                className="h-14 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmAddStudy}
                                className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                            >
                                Add to Planner
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
