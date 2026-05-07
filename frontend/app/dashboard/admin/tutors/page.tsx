"use client"

import { useState } from "react"
import { 
    GraduationCap, Search, Filter, 
    CheckCircle2, XCircle, Eye,
    Mail, Calendar, Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { pendingApplications as initialApplications } from "@/lib/admin-mock-data"

export default function AdminTutorManagement() {
    const [applications, setApplications] = useState(initialApplications)
    const [searchQuery, setSearchQuery] = useState("")

    const handleApprove = (id: string | number) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as any } : a))
    }

    const handleReject = (id: string | number) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' as any } : a))
    }

    const filteredApps = applications.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Tutor Management</h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">VERIFY AND MANAGE EDUCATOR APPLICATIONS</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search tutors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                    </div>
                    <Button variant="outline" className="gap-2 rounded-xl font-bold">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <Card className="rounded-[32px] border-slate-100 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900">{applications.filter(a => a.status === 'pending').length}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-slate-100 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900">{applications.filter(a => a.status === 'approved').length}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Tutors</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[32px] border-slate-100 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900">{applications.filter(a => a.status === 'rejected').length}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-lg rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-50 p-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest">Active Applications</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    {["Tutor", "Specialization", "Experience", "Status", "Actions"].map((h) => (
                                        <th key={h} className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredApps.map((app) => (
                                    <tr key={app.id} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black">
                                                    {app.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{app.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{app.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex flex-wrap gap-1.5">
                                                {app.subjects.map((s: string) => (
                                                    <Badge key={s} variant="secondary" className="bg-slate-100 text-slate-600 text-[8px] font-black uppercase px-2 py-0.5 border-none">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Briefcase className="w-3.5 h-3.5 opacity-40" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{app.experience}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <Badge 
                                                className={cn(
                                                    "text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border",
                                                    app.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    app.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    "bg-sky-50 text-sky-600 border-sky-100"
                                                )}
                                            >
                                                {app.status}
                                            </Badge>
                                        </td>
                                        <td className="py-6 px-8">
                                            {app.status === 'pending' ? (
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleApprove(app.id)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-xl shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handleReject(app.id)}
                                                        className="border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-black text-[9px] uppercase tracking-widest h-8 px-4 rounded-xl"
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" className="gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                                    <Eye className="w-4 h-4" />
                                                    View Profile
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
