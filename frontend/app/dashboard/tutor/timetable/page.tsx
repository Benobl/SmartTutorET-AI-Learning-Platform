"use client"

import { cn } from "@/lib/utils"
import { CalendarDays, Clock, MapPin, User, GraduationCap, LayoutPanelLeft, ListChecks, Plus, X, Brain, Sparkles, Download, ArrowUpRight, Activity, Book, PenTool, SearchCode, History, CheckCircle, Video } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { schedulingApi, liveApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth-utils"
import { LiveClassroom } from "@/components/dashboard/stream/LiveClassroom"
import { useStream } from "@/components/providers/StreamProvider"
import { Call, CallingState } from "@stream-io/video-react-sdk"

// We'll derive these dynamically from the schedule data
const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const DEFAULT_TIME_SLOTS = ["08:30", "10:00", "11:30", "14:00"]

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string; glow: string }> = {
    sky: { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-600", dot: "bg-sky-500", glow: "shadow-sky-500/20" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", dot: "bg-emerald-500", glow: "shadow-emerald-500/20" },
    amber: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", dot: "bg-amber-500", glow: "shadow-amber-500/20" },
    violet: { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-600", dot: "bg-violet-500", glow: "shadow-violet-500/20" },
    rose: { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-600", dot: "bg-rose-500", glow: "shadow-rose-500/20" },
}

export default function TutorTimetable() {
    const { toast } = useToast()
    const [schedule, setSchedule] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCall, setActiveCall] = useState<Call | null>(null)
    const [activeSlot, setActiveSlot] = useState<any | null>(null)
    const [dbSessionId, setDbSessionId] = useState<string | null>(null)
    const { videoClient } = useStream()
    const currentUser = getCurrentUser()

    const fetchMySchedule = async () => {
        try {
            setLoading(true)
            const response = await schedulingApi.getMySchedule()
            setSchedule(response.data || [])
        } catch (error) {
            console.error("Failed to fetch tutor schedule:", error)
            toast({ title: "Error", description: "Failed to load your teaching schedule.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMySchedule()
    }, [])

    const handleJoinClass = async (slot: any) => {
        if (!videoClient) return
        
        try {
            // 1. Create LiveSession in MongoDB
            const sessionRes = await liveApi.create({
                title: `${slot.subject?.title} - Grade ${slot.grade}`,
                subject: slot.subject?._id,
                grade: slot.grade,
                type: 'academic'
            })
            const dbSession = sessionRes.data
            setDbSessionId(dbSession._id)

            // 2. Prepare Stream Call
            const callId = `class-${dbSession._id}`
            const call = videoClient.call('default', callId)
            
            // Ensure the tutor is the host with full permissions
            await call.getOrCreate({
                data: {
                    members: [{ user_id: currentUser?.id || currentUser?._id, role: 'host' }],
                    custom: { 
                        courseName: slot.subject?.title || slot.title || "Academic Session", 
                        tutorName: currentUser?.name,
                        type: 'academic-class',
                        dbSessionId: dbSession._id
                    }
                }
            })
            
            setActiveCall(call)
            setActiveSlot(slot)
        } catch (e: any) {
            console.error("Join Class Error:", e)
            toast({ title: "Connection Failed", description: e.message, variant: "destructive" })
        }
    }

    const { days, timeSlots, byDayAndSlot } = useMemo(() => {
        const dayMap = new Set(DEFAULT_DAYS)
        const slotMap = new Set(DEFAULT_TIME_SLOTS)
        const grid: Record<string, any> = {}

        schedule.forEach(s => {
            const day = s.dayOfWeek || s.day
            const time = s.startTime
            if (day) dayMap.add(day)
            if (time) slotMap.add(time)
            
            const key = `${day}-${time}`
            grid[key] = s
        })

        return {
            days: Array.from(dayMap).sort((a, b) => {
                const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                return dayOrder.indexOf(a) - dayOrder.indexOf(b)
            }),
            timeSlots: Array.from(slotMap).sort(),
            byDayAndSlot: grid
        }
    }, [schedule])

    if (activeCall && activeSlot) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950">
                <LiveClassroom
                    call={activeCall}
                    squadName={activeSlot.subject?.title}
                    courseCode={activeSlot.subject?.code}
                    squadId={activeSlot._id || activeSlot.id}
                    dbSessionId={dbSessionId}
                    onLeave={() => { setActiveCall(null); setActiveSlot(null); setDbSessionId(null); }}
                />
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Teaching <span className="text-blue-600">Agenda</span></h1>
                    <p className="text-slate-500 font-medium mt-2">Manage your assigned academic sessions and live classrooms.</p>
                </div>
                <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest gap-2">
                    <Download className="w-4 h-4" /> Export My Timeline
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <Activity className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-8 border-b border-r border-slate-100 w-32"></th>
                                {days.map(day => (
                                    <th key={day} className="p-8 border-b border-r border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map(time => (
                                <tr key={time}>
                                    <td className="p-8 border-b border-r border-slate-100 text-[11px] font-black text-slate-400 text-center uppercase tracking-widest bg-slate-50/20">
                                        {time}
                                    </td>
                                    {days.map(day => {
                                        const slot = byDayAndSlot[`${day}-${time}`]
                                        return (
                                            <td key={`${day}-${time}`} className="p-4 border-b border-r border-slate-100 last:border-r-0 h-40 align-top group">
                                                {slot ? (
                                                    <div className="h-full w-full rounded-3xl bg-blue-50 border border-blue-100 p-5 space-y-3 hover:shadow-xl transition-all relative">
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-2 py-1 bg-white rounded-lg text-[8px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
                                                                Grade {slot.grade}
                                                            </span>
                                                            <Video className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Teaching Course</span>
                                                            <p className="text-[12px] font-black text-slate-900 leading-tight uppercase italic">{slot.subject?.title || slot.title || "Academic Session"}</p>
                                                        </div>
                                                        <Button 
                                                            onClick={() => handleJoinClass(slot)}
                                                            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest"
                                                        >
                                                            Join Class
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-200">
                                                        <Clock className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
