"use client"

import { timetable as initialTimetable, type TimetableSlot } from "@/lib/student-data"
import { cn } from "@/lib/utils"
import { CalendarDays, Clock, MapPin, User, GraduationCap, LayoutPanelLeft, ListChecks, Plus, X, Brain } from "lucide-react"
import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"

/**
 * Weekly Timetable page — now featuring a "Personal Study Scheduler"
 * that allows students to plan their own reading sessions in empty slots.
 */

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

function SlotCard({ slot, isStudy = false, onDelete }: { slot: TimetableSlot; isStudy?: boolean; onDelete?: () => void }) {
    const colors = colorMap[slot.color] || colorMap.sky
    return (
        <div className={cn(
            "group/slot relative p-4 rounded-3xl border transition-all hover:scale-[1.02] cursor-pointer shadow-sm overflow-hidden",
            isStudy ? "bg-white border-dashed border-indigo-200" : cn(colors.bg, colors.border)
        )}>
            {isStudy && (
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            )}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2.5">
                    <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0 shadow-lg", isStudy ? "bg-indigo-500" : colors.dot, !isStudy && colors.glow)} />
                    <div>
                        <h4 className={cn("text-[13px] font-black leading-tight uppercase tracking-tight", isStudy ? "text-indigo-600" : colors.text)}>
                            {isStudy ? `[Study] ${slot.course}` : slot.course}
                        </h4>
                        {!isStudy && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{slot.room}</p>}
                    </div>
                </div>
                {isStudy && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                        className="opacity-0 group-hover/slot:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                    </div>
                </div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex-1 truncate">
                    {isStudy ? "Self Guided" : slot.tutor}
                </div>
            </div>
        </div>
    )
}

export default function StudentTimetable() {
    const currentDay = getCurrentDay()
    const { toast } = useToast()
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"class" | "study">("class")
    const [studySlots, setStudySlots] = useState<TimetableSlot[]>([])

    // Combine class schedule with personal study plan
    const fullSchedule = useMemo(() => {
        return [...initialTimetable, ...studySlots]
    }, [studySlots])

    const byDay: Record<string, TimetableSlot[]> = {}
    DAYS.forEach((d) => { byDay[d] = [] })
    fullSchedule.forEach((slot) => { byDay[slot.day]?.push(slot) })

    const handleAddStudy = (day: string, time: string) => {
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

        const newSlot: TimetableSlot = {
            id: `study-${Date.now()}`,
            course: "National Exam prep",
            code: "ST-001",
            startTime: time,
            endTime: `${parseInt(time.split(":")[0]) + 1}:00`,
            day: day,
            room: "Study Lounge",
            tutor: "Self",
            color: "indigo"
        }

        setStudySlots(prev => [...prev, newSlot])
        toast({
            title: "Study Session Created",
            description: `Scheduled for ${day} at ${time}.`,
        })
    }

    const handleDeleteStudy = (id: string) => {
        setStudySlots(prev => prev.filter(s => s.id !== id))
        toast({
            title: "Session Removed",
            description: "Study block has been cleared."
        })
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header & Modes */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/5 blur-3xl rounded-full" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Academic Manager</span>
                        <div className="h-px w-10 bg-sky-200" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My <span className="text-sky-500">Agenda</span></h1>
                    <p className="text-slate-500 text-sm font-medium">Coordinate your classes and personal study flow.</p>
                </div>

                <div className="inline-flex p-1.5 bg-slate-50 rounded-[28px] border border-slate-200/60 relative z-10">
                    <button
                        onClick={() => setViewMode("class")}
                        className={cn(
                            "flex items-center gap-2.5 px-8 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
                            viewMode === "class"
                                ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <GraduationCap className="w-4.5 h-4.5" />
                        Class Schedule
                    </button>
                    <button
                        onClick={() => setViewMode("study")}
                        className={cn(
                            "flex items-center gap-2.5 px-8 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
                            viewMode === "study"
                                ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Brain className="w-4.5 h-4.5" />
                        Study Planner
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex gap-2.5 overflow-x-auto pb-4 lg:hidden no-scrollbar">
                {DAYS.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                            (selectedDay || currentDay) === day
                                ? "bg-sky-500 text-white border-sky-600 shadow-lg shadow-sky-500/30"
                                : "bg-white text-slate-500 border-slate-100"
                        )}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden lg:block rounded-[48px] bg-white border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/30">
                <div className="grid grid-cols-[120px_repeat(6,1fr)] bg-slate-50/50 border-b border-slate-100">
                    <div className="p-8" />
                    {DAYS.map((day) => (
                        <div key={day} className={cn("p-8 text-center border-l border-slate-100", day === currentDay && "bg-sky-50/50")}>
                            <p className={cn("text-xs font-black uppercase tracking-widest mb-1", day === currentDay ? "text-sky-600" : "text-slate-400")}>{day.slice(0, 3)}</p>
                            <p className={cn("text-sm font-black italic transition-colors", day === currentDay ? "text-slate-900" : "text-slate-200")}>{day}</p>
                        </div>
                    ))}
                </div>

                {TIME_SLOTS.map((time) => (
                    <div key={time} className="grid grid-cols-[120px_repeat(6,1fr)] border-b border-slate-100 last:border-0 hover:bg-slate-50/20 transition-colors">
                        <div className="p-6 flex items-start justify-center border-r border-slate-50">
                            <span className="text-[11px] text-slate-400 font-black tracking-tighter bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner">{time}</span>
                        </div>
                        {DAYS.map((day) => {
                            const slot = byDay[day]?.find((s) => s.startTime === time)
                            const isStudy = slot?.id.toString().startsWith("study")

                            return (
                                <div
                                    key={`${day}-${time}`}
                                    onClick={() => handleAddStudy(day, time)}
                                    className={cn(
                                        "p-3.5 border-l border-slate-50 min-h-[140px] transition-all relative overflow-hidden cursor-default",
                                        viewMode === "study" && !slot && "hover:bg-indigo-50/40 group/slot-empty cursor-pointer active:scale-95",
                                        day === currentDay && "bg-sky-50/10"
                                    )}
                                >
                                    {slot ? (
                                        <SlotCard
                                            slot={slot}
                                            isStudy={isStudy}
                                            onDelete={() => handleDeleteStudy(slot.id.toString())}
                                        />
                                    ) : viewMode === "study" && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot-empty:opacity-100 transition-opacity">
                                            <div className="flex flex-col items-center gap-1.5 border border-indigo-200 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl shadow-indigo-500/10">
                                                <Plus className="w-5 h-5 text-indigo-500" />
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Schedule Study</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Mobile View Placeholder */}
            <div className="lg:hidden space-y-4">
                {(() => {
                    const day = selectedDay || currentDay
                    const daySlots = byDay[day] || []
                    return daySlots.length > 0 ? (
                        daySlots.map(s => <SlotCard key={s.id} slot={s} isStudy={s.id.toString().startsWith("study")} onDelete={() => handleDeleteStudy(s.id.toString())} />)
                    ) : (
                        <div className="p-16 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                            <LayoutPanelLeft className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                            <h4 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-1">No Activity</h4>
                            <p className="text-slate-400 text-xs font-medium italic">Your schedule is clear for {day}.</p>
                        </div>
                    )
                })()}
            </div>

            {/* Sub-Header Legend */}
            <div className="p-8 rounded-[40px] bg-slate-900 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute -left-10 bottom-0 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />
                <div className="relative z-10 flex items-center justify-between flex-wrap gap-8">
                    <div className="flex items-center gap-5">
                        <div className="w-1.5 h-10 bg-indigo-400 rounded-full" />
                        <div>
                            <h4 className="text-xl font-black tracking-tight">Schedule Fidelity</h4>
                            <p className="text-indigo-200/60 text-[10px] font-black uppercase tracking-widest mt-1">Consistency tracking enabled</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 group">
                            <div className="w-5 h-5 rounded-lg bg-sky-500 shadow-lg shadow-sky-500/40" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">Academic</span>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="w-5 h-5 rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/40 border border-white/20" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">Personal Study</span>
                        </div>
                    </div>

                    <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/40">
                        Export Agenda
                    </button>
                </div>
            </div>
        </div>
    )
}
