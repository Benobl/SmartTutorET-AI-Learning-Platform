"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, Eye, CheckCircle2, XCircle, BarChart3, Plus, Shield, Activity } from "lucide-react";
import { filterTutors } from "@/lib/admin-utils";
import { tutorApplicationsData } from "@/lib/admin-mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

function TutorsContent() {
    const [selectedTutor, setSelectedTutor] = useState<any>(null);
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [statusFilter, setStatusFilter] = useState("All Status");

    // In a real app, these would be fetched and managed via API/State
    const [tutors, setTutors] = useState(filterTutors(query, statusFilter));

    const handleApproveTutor = (id: string) => {
        // Logic to approve tutor
    };

    const handleRejectTutor = (id: string) => {
        // Logic to reject tutor
    };

    const handleReviewVetting = (name: string, degree: string) => {
        setSelectedTutor({ name, degree });
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tutor <span className="text-indigo-600">Operations</span></h2>
                    <p className="text-slate-400 font-medium">Managers oversee vetting; Admin monitors the strategic education pipeline.</p>
                </div>
            </div>

            {/* ── Pipeline Section (Full Width Now) ── */}
            <Card className="border-0 shadow-xl rounded-[40px] bg-white overflow-hidden border border-slate-100">
                <CardHeader className="p-10 pb-0">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        Application Pipeline
                    </CardTitle>
                    <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Real-time applicant flow through institutional vetting</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="h-64 w-full lg:w-1/3">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={tutorApplicationsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        innerRadius={70}
                                        dataKey="count"
                                        strokeWidth={4}
                                        stroke="#fff"
                                    >
                                        {tutorApplicationsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "white", border: "0", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontWeight: 800 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                            {tutorApplicationsData.map((item, idx) => (
                                <div key={idx} className="p-6 rounded-[28px] bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.status}</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{item.count}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">Personnel</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Tutor Directory (Full Width Now) ── */}
            <Card className="border-0 shadow-xl rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-xl border border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-10 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Tutor Directory</CardTitle>
                        <CardDescription className="text-slate-500 font-medium font-bold">Comprehensive list of approved educators on the platform</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-[10px] font-black px-6 py-3 rounded-2xl border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer uppercase tracking-widest"
                        >
                            {["All Status", "pending", "approved", "rejected"].map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/20">
                                    {["Tutor", "Subjects", "Performance", "Vetting Status", "Actions"].map((h) => (
                                        <th key={h} className="text-left py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {tutors.map((tutor) => (
                                    <tr key={tutor.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
                                                    {tutor.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 leading-tight tracking-tight">{tutor.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{tutor.degree} · {tutor.experience}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex flex-wrap gap-2">
                                                {tutor.subjects.slice(0, 3).map((s, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-[9px] font-black py-1 px-3 rounded-lg bg-white border border-slate-100 text-slate-500 uppercase tracking-widest">
                                                        {s}
                                                    </Badge>
                                                ))}
                                                {tutor.subjects.length > 3 && <span className="text-[10px] text-slate-400 font-black">+{tutor.subjects.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                    <span className="text-sm font-black text-slate-700">{tutor.rating}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{tutor.students} Students</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <Badge className={`text-[10px] font-black rounded-lg px-3 py-1.5 uppercase tracking-widest border-0 ${tutor.status === 'approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' :
                                                tutor.status === 'rejected' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10' :
                                                    'bg-amber-100 text-amber-700 border-amber-200'
                                                }`}>
                                                {tutor.status}
                                            </Badge>
                                        </td>
                                        <td className="py-6 px-10">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleReviewVetting(tutor.name, tutor.degree)}
                                                className="h-11 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                                            >
                                                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                Review Vetting
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Simple Vetting Detail Modal */}
            {selectedTutor && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl border-0 shadow-2xl rounded-[40px] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
                        <CardHeader className="bg-slate-50 p-10 border-b border-slate-100 relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedTutor(null)}
                                className="absolute top-6 right-6 rounded-full hover:bg-slate-200"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </Button>
                            <div className="w-20 h-20 rounded-3xl bg-blue-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20">
                                <Shield className="w-10 h-10" />
                            </div>
                            <CardTitle className="text-3xl font-black text-slate-900 leading-tight">Vetting Protocol: <br /><span className="text-blue-600">{selectedTutor.name}</span></CardTitle>
                            <CardDescription className="text-slate-500 font-bold text-sm tracking-wide mt-2">Dossier ID: VET-{Math.random().toString(36).substr(2, 6).toUpperCase()}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Credential</p>
                                    <p className="text-lg font-black text-slate-800">{selectedTutor.degree}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Status</p>
                                    <p className="text-lg font-black text-emerald-600 flex items-center gap-2">Verified <Shield className="w-4 h-4" /></p>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-500" /> Vetting Analysis
                                </h4>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                    "Candidate demonstrates high academic integrity. Documents match institutional registry. Recommend final board approval."
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                                    Final Approval
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedTutor(null)}
                                    className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest"
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function AdminTutorsPage() {
    return (
        <Suspense fallback={<div>Loading Tutors...</div>}>
            <TutorsContent />
        </Suspense>
    );
}
