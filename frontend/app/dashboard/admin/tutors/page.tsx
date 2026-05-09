"use client"

import { useState, useEffect } from "react"
import { 
    GraduationCap, Search, Filter, 
    CheckCircle2, XCircle, Eye,
    Mail, Calendar, Briefcase, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { adminApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTutorManagement() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchTutors = async () => {
        try {
            setLoading(true)
            const res = await adminApi.getPendingTutors()
            // In the real backend, 'pending-tutors' returns users with role 'tutor' and status 'pending'
            setApplications(res.data || [])
        } catch (error) {
            console.error("Failed to fetch tutor applications", error)
            toast({ title: "Fetch Error", description: "Could not sync with the educator registry.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTutors()
    }, [])

    const handleApprove = async (id: string) => {
        try {
            await adminApi.approveTutor(id)
            toast({ title: "Tutor Approved", description: "The educator has been granted platform access.", className: "bg-emerald-500 text-white" })
            fetchTutors()
        } catch (error: any) {
            toast({ title: "Approval Failed", description: error.message, variant: "destructive" })
        }
    }

    const handleReject = async (id: string) => {
        try {
            await adminApi.rejectTutor(id, "Application does not meet platform requirements.")
            toast({ title: "Tutor Rejected", description: "The application has been archived.", variant: "destructive" })
            fetchTutors()
        } catch (error: any) {
            toast({ title: "Rejection Failed", description: error.message, variant: "destructive" })
        }
    }

    const filteredApps = applications.filter(app => 
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Tutor <span className="text-sky-500">Registry</span></h1>
                    <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-1">Verify and manage educator infrastructure</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                            type="text"
                            placeholder="SEARCH BY IDENTITY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 bg-white text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-slate-300 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-slate-100 hover:bg-slate-50 shadow-sm transition-all">
                        <Filter className="w-5 h-5 text-slate-400" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { label: "Pending Review", value: applications.length, icon: GraduationCap, color: "sky" },
                    { label: "Verified Tutors", value: "Real-time Data", icon: CheckCircle2, color: "emerald" },
                    { label: "Security Risk", value: "Zero Flags", icon: Shield, color: "rose" }
                ].map((stat, i) => (
                    <Card key={i} className="rounded-[40px] border-0 bg-white shadow-xl shadow-slate-100/50 group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                        <CardContent className="p-10 relative">
                            <div className={cn("absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700", `text-${stat.color}-500`)}>
                                <stat.icon className="w-20 h-20" />
                            </div>
                            <div className="flex items-center gap-6">
                                <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner", `bg-${stat.color}-50 text-${stat.color}-500`)}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{loading ? "..." : stat.value}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-0 shadow-2xl rounded-[48px] overflow-hidden bg-white border-white">
                <CardHeader className="bg-slate-50/30 border-b border-slate-100 p-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1.5 italic">Active Applications</CardTitle>
                            <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Queue for Educator Onboarding</CardDescription>
                        </div>
                        <Button 
                            variant="ghost" 
                            onClick={fetchTutors}
                            className="h-10 w-10 p-0 rounded-xl text-slate-300 hover:text-sky-500 hover:bg-sky-50 transition-all"
                        >
                            <Loader2 className={cn("w-5 h-5", loading && "animate-spin")} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/20">
                                    {["Educator Identity", "Academic Profile", "Status", "Registry Actions"].map((h) => (
                                        <th key={h} className="text-left py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={4} className="p-10"><Skeleton className="h-12 w-full rounded-2xl" /></td>
                                        </tr>
                                    ))
                                ) : filteredApps.length > 0 ? filteredApps.map((app) => (
                                    <tr key={app._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-slate-100 to-slate-50 border border-white shadow-sm flex items-center justify-center text-slate-400 font-black text-lg group-hover:scale-105 transition-transform duration-500">
                                                    {app.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1 italic">{app.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-wide">{app.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-3 h-3 text-sky-400" />
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{app.tutorProfile?.qualification || "General Educator"}</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Level: {app.tutorProfile?.experience || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <Badge 
                                                className={cn(
                                                    "text-[9px] font-black uppercase px-3 py-1.5 rounded-xl shadow-sm border-0",
                                                    app.tutorStatus === 'approved' ? "bg-emerald-500 text-white" :
                                                    app.tutorStatus === 'rejected' ? "bg-rose-500 text-white" :
                                                    "bg-sky-50 text-sky-500 border border-sky-100"
                                                )}
                                            >
                                                {app.tutorStatus || 'pending'}
                                            </Badge>
                                        </td>
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-3">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleApprove(app._id)}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest h-11 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Validate
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleReject(app._id)}
                                                    className="border-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-black text-[10px] uppercase tracking-widest h-11 px-6 rounded-2xl transition-all"
                                                >
                                                    Archive
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center opacity-40">
                                            <div className="flex flex-col items-center gap-4">
                                                <GraduationCap className="w-12 h-12 text-slate-300" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No pending applications found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function Shield(props: any) {
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
