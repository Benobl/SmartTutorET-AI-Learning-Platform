"use client"

import { useState, useEffect } from "react"
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    MapPin,
    Filter,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSchedules, getCourses } from "@/lib/manager-utils"

export default function ScheduleMaster() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]

    const [scheduleData, setScheduleData] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])

    useEffect(() => {
        setScheduleData(getSchedules())
        setCourses(getCourses())
    }, [])

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header - Industrial Minimalism Light */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Master Timeline</h1>
                    <p className="text-slate-500 font-medium text-sm">Coordinate school-wide slots and physical space.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl h-12 px-6 font-bold text-xs uppercase tracking-widest shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold px-8 h-12 text-sm shadow-md">
                        Add Entry
                    </Button>
                </div>
            </div>

            {/* Grid-based Schedule - Professional Light Style */}
            <Card className="bg-white border-slate-200 overflow-hidden rounded-[32px] border shadow-md">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 rounded-lg">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="px-4 text-[11px] font-black uppercase tracking-widest text-slate-600">Current Week</span>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 rounded-lg">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-widest shadow-sm font-semibold">
                                Grade 12 Registry
                            </div>
                            <Filter className="w-4 h-4" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 border-b border-r border-slate-100 w-24"></th>
                                {days.map(day => (
                                    <th key={day} className="p-6 border-b border-r border-slate-100 text-[11px] uppercase tracking-[0.3em] font-black text-slate-400 last:border-r-0">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((time) => (
                                <tr key={time}>
                                    <td className="p-6 border-b border-r border-slate-100 text-[10px] font-black text-slate-300 text-center uppercase tracking-widest">
                                        {time}
                                    </td>
                                    {days.map(day => {
                                        const schedule = scheduleData.find(s => s.day === day && s.startTime.startsWith(time.split(':')[0]))
                                        const course = schedule ? courses.find(c => c.id === schedule.courseId) : null

                                        return (
                                            <td key={`${day}-${time}`} className="p-2 border-b border-r border-slate-100 last:border-r-0 h-32 align-top">
                                                {course && (
                                                    <div className="h-full w-full rounded-[20px] bg-sky-50 border border-sky-100 p-5 space-y-3 hover:bg-sky-100/50 transition-all cursor-pointer group shadow-sm">
                                                        <div className="flex items-center justify-between opacity-60">
                                                            <span className="text-[9px] font-black text-sky-700 uppercase tracking-[0.2em]">{course.code}</span>
                                                            <Clock className="w-3 h-3 text-sky-600" />
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-900 tracking-wide line-clamp-2">{course.name}</p>
                                                        <div className="flex items-center justify-between pt-2">
                                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-sky-600 uppercase tracking-widest">
                                                                <MapPin className="w-3 h-3" />
                                                                {schedule.room}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {!course && (
                                                    <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" className="h-10 w-10 rounded-full bg-slate-50 text-slate-300 hover:text-slate-600 border border-slate-100">
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
