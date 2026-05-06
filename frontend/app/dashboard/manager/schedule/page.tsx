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
    Download,
    Trash2,
    FileDown,
    Layers,
    GraduationCap,
    CheckCircle2,
    User,
    SortAsc,
    SortDesc,
    ArrowUpDown,
    X,
    TrendingUp,
    Zap
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getMasterSchedules, getCourses, getAllTutors, addScheduleEntry, deleteScheduleEntry, exportToPDF, generateGradeSchedule } from "@/lib/manager-utils"
import { toast } from "sonner"

export default function ScheduleMaster() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const timeSlots = ["08:00", "09:30", "11:00", "12:30", "14:00", "15:30"]

    const [scheduleData, setScheduleData] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [tutors, setTutors] = useState<any[]>([])
    const [selectedGrade, setSelectedGrade] = useState("12")
    const [selectedSemester, setSelectedSemester] = useState("Semester 1")
    const [selectedSection, setSelectedSection] = useState("Section A")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [showExamsOnly, setShowExamsOnly] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form state
    const [newEntry, setNewEntry] = useState({
        courseId: "",
        tutorId: "",
        day: "Monday",
        startTime: "08:00",
        endTime: "09:30",
        room: "Online Hub A",
        type: "regular" as "regular" | "midterm" | "final",
        grade: "",
        stream: "Common"
    })

    const refreshData = async () => {
        try {
            setLoading(true)
            const scheduleData = await getMasterSchedules()
            setScheduleData(scheduleData)
            
            const coursesList = await getCourses()
            setCourses(coursesList)
            
            const tutorsList = await getAllTutors()
            if (Array.isArray(tutorsList)) {
                setTutors(tutorsList)
            }
        } catch (error) {
            console.error("Failed to refresh schedule data:", error)
            toast.error("Resource synchronization failed.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshData()
    }, [])

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEntry.courseId || !newEntry.tutorId) {
            toast.error("Please fill in all required fields.")
            return
        }

        const payload = {
            ...newEntry,
            subject: newEntry.courseId,
            tutor: newEntry.tutorId,
            dayOfWeek: newEntry.day,
            grade: newEntry.grade || selectedGrade,
            semester: selectedSemester,
            section: selectedSection
        }

        const result = await addScheduleEntry(payload)
        
        if (result) {
            setIsAddModalOpen(false)
            setNewEntry({ courseId: "", tutorId: "", day: "Monday", startTime: "08:00", endTime: "09:30", room: "Online Hub A", type: "regular", grade: "" })
            refreshData()
            toast.success(newEntry.type === 'regular' ? "Semester slot synchronized." : "Exam slot locked.")
        } else {
            toast.error("Failed to update master schedule.")
        }
    }

    const handleAISyncSchedule = async () => {
        try {
            setLoading(true)
            const result = await generateGradeSchedule(selectedGrade, "Common", courses)
            if (result && result.length > 0) {
                // Assign first available tutor as default for AI slots
                const defaultTutorId = tutors[0]?._id || tutors[0]?.id;
                
                for (const item of result) {
                    const subject = courses.find((c: any) => 
                        (c.title || c.name || "").toLowerCase().includes(item.subjectTitle.toLowerCase())
                    );
                    
                    if (subject) {
                        await addScheduleEntry({
                            grade: selectedGrade,
                            stream: "Common",
                            semester: selectedSemester,
                            section: selectedSection,
                            subject: subject._id || subject.id,
                            tutor: defaultTutorId,
                            dayOfWeek: item.dayOfWeek,
                            startTime: item.startTime,
                            endTime: item.endTime,
                            type: "regular"
                        });
                    }
                }
                toast.success(`Gemini created a ${result.length}-slot weekly timetable for Grade ${selectedGrade}!`)
                refreshData()
            }
        } catch (error) {
            console.error("AI scheduling failed:", error)
            toast.error("AI scheduling failed.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        const success = await deleteScheduleEntry(id)
        if (success) {
            refreshData()
            toast.error("Slot released.")
        } else {
            toast.error("Failed to remove slot.")
        }
    }

    const handleExportPDF = () => {
        const columns = ['day', 'startTime', 'endTime', 'courseName', 'tutorName', 'room', 'type']
        const exportData = scheduleData
            .filter((s: any) => s.grade === selectedGrade && s.semester === selectedSemester && s.section === selectedSection)
            .map((s: any) => ({
                ...s,
                courseName: courses.find((c: any) => (c._id || c.id) === s.subject?._id)?.title || 'Unknown',
                tutorName: tutors.find((t: any) => (t._id || t.id) === s.tutor?._id)?.name || 'Unassigned'
            }))

        exportToPDF(exportData, columns, `Institutional Timeline: Grade ${selectedGrade} - ${selectedSemester} (${selectedSection})`, `schedule_grade_${selectedGrade}`)
        toast.success("Timeline exported as PDF.")
    }

    // Filtered data for the grid
    const currentViewData = scheduleData.filter((s: any) =>
        s.grade === selectedGrade &&
        s.semester === selectedSemester &&
        s.section === selectedSection
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 relative">
            {/* Mesh Background Accent */}
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-1 relative z-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Master <span className="text-blue-500">Timeline</span></h1>
                    <p className="text-slate-400 font-medium">Coordinate semester-wide recurring slots and online room assignments.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        className="bg-white/80 backdrop-blur-md border-slate-200 hover:bg-white text-slate-600 rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest transition-all shadow-sm group"
                    >
                        <FileDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                        Export Timeline
                    </Button>
                    <Button
                        onClick={handleAISyncSchedule}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest shadow-2xl shadow-emerald-500/30 transition-all active:scale-95"
                    >
                        <Zap className={`w-5 h-5 fill-white ${loading ? 'animate-pulse' : ''}`} />
                        {loading ? 'Generating...' : 'AI Suggest Timetable'}
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Initialize Slot
                    </Button>
                </div>
            </div>

            {/* Comprehensive Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-6 rounded-[30px] shadow-sm space-y-3 group hover:border-blue-200 transition-all">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Academic Grade</Label>
                    <div className="flex flex-wrap gap-2">
                        {["9", "10", "11", "12"].map(grade => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={`h-11 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedGrade === grade ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                G-{grade}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-6 rounded-[30px] shadow-sm space-y-3 group hover:border-blue-200 transition-all">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Active Semester</Label>
                    <div className="flex gap-2">
                        {["Semester 1", "Semester 2"].map(sem => (
                            <button
                                key={sem}
                                onClick={() => setSelectedSemester(sem)}
                                className={`flex-1 h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedSemester === sem ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                {sem}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-6 rounded-[30px] shadow-sm space-y-3 group hover:border-blue-200 transition-all flex flex-col justify-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Institutional Pulse</Label>
                    <button
                        onClick={() => setShowExamsOnly(!showExamsOnly)}
                        className={`w-full h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${showExamsOnly ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-xl shadow-rose-500/10' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                    >
                        {showExamsOnly ? <Zap className="w-4 h-4 fill-rose-500" /> : <Layers className="w-4 h-4" />}
                        {showExamsOnly ? 'Exam Pulse Active' : 'Regular View'}
                    </button>
                </div>
            </div>

            {/* Grid-based Schedule */}
            <Card className="bg-white/90 backdrop-blur-xl border-slate-100 overflow-hidden rounded-[45px] border shadow-2xl shadow-slate-200/50 relative z-10">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Academic Pulse</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Recurring Semester Timeline
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-4 px-6 py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regular</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Midterm</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Final</span>
                                </div>
                            </div>
                            <Badge className="bg-blue-50 text-blue-600 border-0 font-black px-5 py-2 rounded-full text-[10px] uppercase tracking-widest shadow-sm">
                                G-{selectedGrade} • {selectedSection}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="p-8 border-b border-r border-slate-50 w-32 bg-slate-50/10"></th>
                                {days.map(day => (
                                    <th key={day} className="p-8 border-b border-r border-slate-50 text-[11px] uppercase tracking-[0.4em] font-black text-slate-400 last:border-r-0">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((time) => (
                                <tr key={time} className="group/row">
                                    <td className="p-8 border-b border-r border-slate-50 text-[11px] font-black text-slate-400 text-center uppercase tracking-widest bg-slate-50/5 group-hover/row:text-blue-500 transition-colors">
                                        {time}
                                    </td>
                                    {days.map(day => {
                                        let schedule = currentViewData.find((s: any) => (s.day === day || s.dayOfWeek === day) && s.startTime === time)

                                        // If Exam Pulse is on, hide regular slots
                                        if (showExamsOnly && schedule?.type === 'regular') {
                                            schedule = null
                                        }

                                        const subject = schedule?.subject
                                        const tutor = schedule?.tutor

                                        let bgColor = "from-blue-50 to-indigo-50 border-blue-100/50"
                                        let accentColor = "bg-blue-500"
                                        let textColor = "text-blue-600"

                                        if (schedule?.type === 'midterm') {
                                            bgColor = "from-amber-50 to-orange-50 border-amber-100/50"
                                            accentColor = "bg-amber-500"
                                            textColor = "text-amber-600"
                                        } else if (schedule?.type === 'final') {
                                            bgColor = "from-rose-50 to-pink-50 border-rose-100/50"
                                            accentColor = "bg-rose-500"
                                            textColor = "text-rose-600"
                                        }

                                        return (
                                            <td key={`${day}-${time}`} className="p-4 border-b border-r border-slate-50 last:border-r-0 h-44 align-top group/cell">
                                                {schedule && (
                                                    <div className={`h-full w-full rounded-[30px] bg-gradient-to-br ${bgColor} border p-6 space-y-4 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-500`}>
                                                        {/* Slot identifier pattern */}
                                                        <div className={`absolute -bottom-4 -right-4 w-20 h-20 ${accentColor} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-all`} />

                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className={`px-3 py-1 bg-white/80 rounded-full text-[9px] font-black ${textColor} uppercase tracking-widest shadow-sm border border-white/50`}>
                                                                {subject?.code || 'REG'}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDelete(schedule._id || schedule.id)}
                                                                className="w-8 h-8 rounded-xl bg-white/50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm font-black text-slate-800 tracking-tight leading-tight line-clamp-2 relative z-10 uppercase">{subject?.title || subject?.name || 'Academic Slot'}</p>
                                                        <div className="flex flex-col gap-2 pt-1 relative z-10">
                                                            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/40 w-fit px-2 py-1 rounded-lg">
                                                                <User className="w-3 h-3 text-blue-500" />
                                                                {tutor?.name || 'Staff Member'}
                                                            </span>
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                    <MapPin className={`w-3.5 h-3.5 ${textColor}`} />
                                                                    {schedule.room}
                                                                </span>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${accentColor} shadow-sm`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {!schedule && (
                                                    <div className="h-full w-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-500">
                                                        <Button
                                                            onClick={() => {
                                                                setNewEntry({ ...newEntry, day, startTime: time })
                                                                setIsAddModalOpen(true)
                                                            }}
                                                            variant="ghost"
                                                            className="h-14 w-14 rounded-full bg-blue-50 text-blue-400 hover:text-white hover:bg-blue-600 border border-blue-100 shadow-lg shadow-blue-500/10 active:scale-90 transition-all"
                                                        >
                                                            <Plus className="w-6 h-6" />
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

            {/* Add Entry Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-white rounded-[40px] p-0 overflow-y-auto overflow-x-hidden border-0 shadow-3xl">
                    <div className="p-10 bg-slate-50/50 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-slate-800 leading-none">Slot Initialization</DialogTitle>
                            <p className="text-slate-400 font-medium text-sm mt-2">Provision a structured academic window for Grade {selectedGrade}.</p>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleAddEntry} className="p-10 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phase Distinction</Label>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { id: 'regular', label: 'Regular', color: 'blue' },
                                    { id: 'midterm', label: 'Midterm', color: 'amber' },
                                    { id: 'final', label: 'Final', color: 'rose' },
                                    { id: 'one-to-one', label: '1-to-1', color: 'indigo' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setNewEntry({ ...newEntry, type: type.id as any })}
                                        className={`p-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${newEntry.type === type.id ? `bg-${type.color}-50 border-${type.color}-500 text-${type.color}-600 shadow-lg shadow-${type.color}-500/10` : 'bg-slate-50 border-transparent text-slate-400'}`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Staff Faculty</Label>
                            <select
                                className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                value={newEntry.tutorId}
                                onChange={(e) => setNewEntry({ ...newEntry, tutorId: e.target.value })}
                                required
                            >
                                <option value="">Select Faculty Member...</option>
                                {tutors.map((t: any) => (
                                    <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade Level</Label>
                            <select
                                className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                value={newEntry.grade}
                                onChange={(e) => setNewEntry({ ...newEntry, grade: e.target.value })}
                                required
                            >
                                <option value="">Select Grade...</option>
                                <option value="9">Grade 9</option>
                                <option value="10">Grade 10</option>
                                <option value="11">Grade 11</option>
                                <option value="12">Grade 12</option>
                            </select>
                        </div>

                        {(newEntry.grade === "11" || newEntry.grade === "12") && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Stream</Label>
                                <select
                                    className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                    value={newEntry.stream}
                                    onChange={(e) => setNewEntry({ ...newEntry, stream: e.target.value })}
                                    required
                                >
                                    <option value="Common">Common (All Streams)</option>
                                    <option value="Natural Science">Natural Science</option>
                                    <option value="Social Science">Social Science</option>
                                </select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Curriculum Component</Label>
                            <select
                                className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                value={newEntry.courseId}
                                onChange={(e) => setNewEntry({ ...newEntry, courseId: e.target.value })}
                                required
                            >
                                <option value="">Select Course...</option>
                                {courses.map((c: any) => (
                                    <option key={c._id || c.id} value={c._id || c.id}>{c.title || c.name} ({c.code || 'N/A'})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Virtual Hub</Label>
                                <Input
                                    placeholder="e.g. Virtual Hall A"
                                    className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                    value={newEntry.room || 'Virtual Hub A'}
                                    onChange={(e) => setNewEntry({ ...newEntry, room: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start</Label>
                                    <Input
                                        className="bg-white border-slate-200 h-12 rounded-xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                        value={newEntry.startTime}
                                        onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End</Label>
                                    <Input
                                        className="bg-white border-slate-200 h-12 rounded-xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                        value={newEntry.endTime}
                                        onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full sm:flex-none sm:w-40 rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] text-slate-400 hover:bg-slate-50 transition-all"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                            >
                                Synchronize Slot
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
