"use client"

import { useState, useEffect } from "react"
import {
    Users,
    BookOpen,
    CalendarDays,
    FileText,
    TrendingUp,
    CheckCircle2,
    Clock,
    ArrowRight,
    Activity,
    ExternalLink,
    FileCheck,
    Briefcase,
    ShieldCheck,
    FileSearch,
    Download,
    Eye,
    XCircle,
    GraduationCap,
    UserCheck,
    Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { getCurrentUser } from "@/lib/auth-utils"
import { adminApi } from "@/lib/api"
import {
    getStudents,
    getPendingTutors,
    getCourses,
    getJobs,
    getSystemStats,
    approveTutor,
    rejectTutor,
    exportReport,
    getFullExportData,
    getNotifications,
    markNotificationAsRead,
    getPendingSubjects
} from "@/lib/manager-utils"
import Link from "next/link"
import { toast } from "sonner"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Bell } from "lucide-react"

export default function ManagerDashboard() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<any[]>([])
    const [system, setSystem] = useState<any>(null)
    const [pendingTutors, setPendingTutors] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(false)

    // Modal states
    const [selectedTutor, setSelectedTutor] = useState<any>(null)
    const [vettingModalOpen, setVettingModalOpen] = useState(false)
    const [docType, setDocType] = useState<'degree' | 'cv' | null>(null)

    const refreshData = async () => {
        const currentUser = getCurrentUser()
        setUser(currentUser)

        const students = await getStudents()
        const pending = await getPendingTutors()
        const statsRes = await adminApi.getStats()
        const statsData = statsRes.data || { totalStudents: 0, totalTutors: 0, pendingTutors: 0, totalJobs: 0 }
        
        const courses = await getCourses()
        const jobs = await getJobs()
        const pendingSubjects = await getPendingSubjects()

        setPendingTutors(pending)
        const notifs = await getNotifications()
        setNotifications(notifs)
        setStats([
            { label: "Pending Vetting", value: statsData.pendingTutors.toString(), icon: ShieldCheck, color: "text-blue-500", bgColor: "bg-blue-50/50" },
            { label: "New Subjects", value: pendingSubjects.length.toString(), icon: GraduationCap, color: "text-emerald-500", bgColor: "bg-emerald-50/50" },
            { label: "Active Courses", value: courses.length.toString(), icon: BookOpen, color: "text-sky-500", bgColor: "bg-sky-50/50" },
            { label: "Total Students", value: statsData.totalStudents.toString(), icon: TrendingUp, color: "text-indigo-500", bgColor: "bg-indigo-50/50" },
        ])
        setSystem({ health: "99.9%" })
    }

    useEffect(() => {
        refreshData()
    }, [])

    const handleOpenVetting = (tutor: any) => {
        setSelectedTutor(tutor)
        setVettingModalOpen(true)
        setDocType(null)
    }

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setIsProcessing(true)
        try {
            if (action === 'approve') {
                const success = await approveTutor(id)
                if (success) {
                    toast.success("Strategic Faculty activated.")
                    toast.info(`Success: Activation email dispatched to faculty member.`, {
                        description: "The tutor can now secure access to their educator terminal.",
                        duration: 5000
                    })
                } else {
                    toast.error("Failed to approve tutor.")
                }
            } else {
                const reason = window.prompt("Please enter the reason for rejection (this will be sent to the tutor):");
                if (reason === null) {
                    setIsProcessing(false);
                    return;
                }
                const success = await rejectTutor(id, reason)
                if (success) {
                    toast.error("Application archived as rejected.")
                } else {
                    toast.error("Failed to reject application.")
                }
            }
            setVettingModalOpen(false)
            await refreshData()
        } catch (error: any) {
            toast.error(error.message || "An error occurred.")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id)
        await refreshData()
    }

    const handleExport = async () => {
        const data = await getFullExportData()
        exportReport(data, 'SmartTutorET_Manager_Report')
        toast.success("Report exported successfully.")
    }

    const managerName = user ? (user.name?.split(' ')[0] || user.name) : "Manager"

    return (
        <div className="relative space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 overflow-x-hidden">
            {/* Mesh Background Accents */}
            <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                        Registrar <span className="text-blue-500">Terminal</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Monitoring SmartTutorET institutional performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-12 h-12 p-0 rounded-2xl bg-white/80 backdrop-blur-md border-slate-200 text-slate-400 hover:text-blue-500 relative transition-all shadow-sm"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-[28px] border-slate-100 shadow-3xl bg-white overflow-hidden" align="end">
                            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Alerts</h4>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 relative ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                                        >
                                            {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />}
                                            <div className="flex flex-col gap-1 pl-2">
                                                <p className="text-xs font-black text-slate-800">{n.title}</p>
                                                <p className="text-[10px] text-slate-400 leading-tight font-medium">{n.message}</p>
                                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">{n.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No alerts</p>
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="bg-white/80 backdrop-blur-md border-slate-200 text-slate-600 rounded-2xl hover:bg-white transition-all font-bold h-12 px-6 shadow-sm group"
                    >
                        <Download className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                        Export Reports
                    </Button>
                    <Link href="/dashboard/manager/jobs">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                            Post Placement
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid - Modern Lighter Look */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="bg-white/70 backdrop-blur-xl border-white rounded-[32px] hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 border shadow-sm group overflow-hidden">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-slate-800">{stat.value}</p>
                                    <span className="text-xs font-bold text-emerald-500">+4%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative">
                {/* Vetting Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Academic Vetting Queue
                        </h2>
                        <Link href="/dashboard/manager/tutors" className="text-blue-500 text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-2 group">
                            Full Registry <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {pendingTutors.length > 0 ? (
                            pendingTutors.slice(0, 4).map((tutor, idx) => (
                                <div key={idx} className="p-6 rounded-[32px] bg-white border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:translate-x-2 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 flex items-center justify-center text-2xl font-black text-blue-600 uppercase shadow-inner">
                                            {tutor.name?.[0] || 'T'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-slate-700 text-lg">{tutor.name}</p>
                                                <Badge className="bg-blue-500/10 text-blue-500 border-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">Verification Pending</Badge>
                                            </div>
                                            <p className="text-[13px] text-slate-400 font-bold uppercase tracking-wide mt-1">{(tutor.subjects || []).join(', ') || 'No subjects'} • {tutor.documents?.degree || 'No degree'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleOpenVetting(tutor)}
                                            variant="outline"
                                            disabled={isProcessing}
                                            className="border-slate-200 text-slate-500 hover:bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest px-6 h-12 transition-all shadow-sm"
                                        >
                                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Review Credentials"}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-16 rounded-[40px] bg-slate-50/50 border border-dashed border-slate-200 text-center">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-1">Queue Synchronized</h3>
                                <p className="text-slate-400 font-medium">All pending educator applications have been processed.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Health */}
                <div className="space-y-6">
                    <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.25em] px-4">System Logistics</h2>
                    <Card className="bg-white border-slate-100 rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 animate-pulse">
                                    <Activity className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-700">Service Integrity</p>
                                    <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">{system?.health || '99.9%'} Verified Stable</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Latency</span>
                                        <span className="text-sm font-black text-blue-500">120ms</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[70%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DB Throughput</span>
                                        <span className="text-sm font-black text-indigo-500">Stable</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black py-7 text-[11px] uppercase tracking-widest border border-slate-100 shadow-sm transition-all active:scale-95">
                                Launch Diagnostics
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Vetting / Application Modal */}
            <Dialog open={vettingModalOpen} onOpenChange={setVettingModalOpen}>
                <DialogContent className="sm:max-w-[700px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-3xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Tutor Application Vetting</DialogTitle>
                    </DialogHeader>
                    {selectedTutor && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8 relative">
                                <div className="absolute top-6 right-8">
                                    <Badge className="bg-blue-500 text-white border-0 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                        Vetting Mode
                                    </Badge>
                                </div>
                                <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-500/30">
                                    {selectedTutor.name?.[0] || 'T'}
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl font-black text-slate-800 leading-none mb-2">{selectedTutor.name}</h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                        <span className="text-blue-500 font-black text-xs tracking-widest uppercase">{(selectedTutor.subjects || []).join(', ') || 'No subjects'}</span>
                                        {selectedTutor.documents?.degree && (
                                            <><span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{selectedTutor.documents.degree}</span></>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                {/* Simulated Document Viewers */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 px-1 flex items-center gap-2">
                                        <FileSearch className="w-4 h-4 text-slate-300" /> Attachment Verification
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                const path = selectedTutor.documents?.degree;
                                                if (!path) return;
                                                const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                                                
                                                if (path.includes('/') || path.includes('.')) {
                                                    const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
                                                    console.log("Opening degree:", url);
                                                    window.open(url, '_blank');
                                                } else {
                                                    toast.info(`Qualification: ${path}`, {
                                                        description: "Text-based entry provided during registration.",
                                                        duration: 5000
                                                    });
                                                }
                                                setDocType('degree');
                                            }}
                                            className={`p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center gap-4 group ${docType === 'degree' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${docType === 'degree' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Credentials</p>
                                                <p className={`text-xs font-bold truncate ${docType === 'degree' ? 'text-blue-600' : 'text-slate-600'}`}>{selectedTutor.documents?.degree ? (selectedTutor.documents.degree.includes('/') ? selectedTutor.documents.degree.split('/').pop() : selectedTutor.documents.degree) : 'No degree uploaded'}</p>
                                            </div>
                                            <ExternalLink className={`w-3.5 h-3.5 ml-auto transition-opacity ${selectedTutor.documents?.degree ? 'opacity-100 text-blue-500' : 'opacity-20'}`} />
                                        </button>

                                        <button
                                            onClick={() => {
                                                const path = selectedTutor.documents?.cv;
                                                if (!path) return;
                                                const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                                                
                                                if (path.includes('/') || path.includes('.')) {
                                                    const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
                                                    console.log("Opening CV:", url);
                                                    window.open(url, '_blank');
                                                } else {
                                                    toast.info(`Resume Detail: ${path}`, {
                                                        description: "Text-based entry provided during registration.",
                                                        duration: 5000
                                                    });
                                                }
                                                setDocType('cv');
                                            }}
                                            className={`p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center gap-4 group ${docType === 'cv' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${docType === 'cv' ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Professional CV</p>
                                                <p className={`text-xs font-bold truncate ${docType === 'cv' ? 'text-indigo-600' : 'text-slate-600'}`}>{selectedTutor.documents?.cv ? (selectedTutor.documents.cv.includes('/') ? selectedTutor.documents.cv.split('/').pop() : selectedTutor.documents.cv) : 'No CV uploaded'}</p>
                                            </div>
                                            <ExternalLink className={`w-3.5 h-3.5 ml-auto transition-opacity ${selectedTutor.documents?.cv ? 'opacity-100 text-indigo-500' : 'opacity-20'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Area - Lighter Aesthetic */}
                                {docType && (
                                    <div className="p-8 rounded-[32px] bg-blue-50/50 border border-blue-100 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden text-center">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/10 rounded-full blur-[80px] pointer-events-none" />
                                        <div className="flex flex-col items-center gap-6 relative z-10">
                                            <div className="w-16 h-16 rounded-3xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-xl shadow-blue-500/5">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-blue-900 font-black text-xs uppercase tracking-[0.2em]">Redirecting to Secure Viewer</h4>
                                                <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-widest">A NEW TAB HAS BEEN TRIGGERED FOR {docType.toUpperCase()} INSPECTION</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 px-1">Biography / Career Summary</h3>
                                    <p className="text-slate-600 text-[14px] leading-relaxed bg-slate-50/50 p-6 rounded-[28px] border border-slate-100 italic relative">
                                        <span className="absolute top-3 left-4 text-3xl text-slate-100 font-serif leading-none">“</span>
                                        {selectedTutor.skills || 'The educator has not provided a professional biography.'}
                                        <span className="absolute bottom-3 right-4 text-3xl text-slate-100 font-serif leading-none">”</span>
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                    <Button
                                        onClick={() => handleAction(selectedTutor._id || selectedTutor.id, 'reject')}
                                        disabled={isProcessing}
                                        className="w-full sm:flex-1 bg-white border-2 border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 rounded-2xl h-16 font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-sm group"
                                    >
                                        <XCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                        Reject Application
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(selectedTutor._id || selectedTutor.id, 'approve')}
                                        disabled={isProcessing}
                                        className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-16 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 transition-all active:scale-95 group"
                                    >
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                                        Approve & Verify
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
