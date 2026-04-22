"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Award, BookOpen, Clock, Eye, MessageSquare, MoreHorizontal } from "lucide-react";
import { filterStudents } from "@/lib/admin-utils";
import { adminUserList } from "@/lib/admin-mock-data";

function StudentsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [statusFilter, setStatusFilter] = useState("All Status");

    const students = filterStudents(query, statusFilter);

    const handleMessage = (name: string) => {
        alert(`Opening secure channel to ${name}...`);
    };

    const handleMoreActions = (name: string) => {
        alert(`Opening administrative tools for ${name}`);
    };

    return (
        <div className="space-y-8">
            {/* Student Success Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Students", value: students.length.toString(), icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Avg. Performance", value: "84%", icon: Award, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Course Enrollment", value: "12.4k", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Daily Attendance", value: "92%", icon: Clock, color: "text-rose-500", bg: "bg-rose-50" },
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Card className="border-0 shadow-xl rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-xl border-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Student Body Management</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Monitor and support student academic journeys</CardDescription>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs font-black px-4 py-2.5 rounded-xl border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    >
                        {["All Status", "Active", "Inactive", "Suspended"].map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    {["Student", "Status", "Joined", "Academic Level", "Support"].map((h) => (
                                        <th key={h} className="text-left py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-200 flex items-center justify-center text-indigo-500 font-black text-sm group-hover:scale-105 transition-transform">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{student.name}</p>
                                                    <p className="text-xs text-slate-400 font-bold mt-0.5">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge
                                                className={`text-[10px] font-black rounded-lg px-2.5 py-1 uppercase tracking-wider ${student.status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' :
                                                    student.status === 'Suspended' ? 'bg-rose-500 text-white' :
                                                        'bg-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                {student.status}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8 text-xs text-slate-500 font-bold">{student.joined}</td>
                                        <td className="py-5 px-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black text-slate-700">Grade {student.grade}</span>
                                                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-[75%] rounded-full" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleMessage(student.name)}
                                                    className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleMoreActions(student.name)}
                                                    className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 transition-all"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminStudentsPage() {
    return (
        <Suspense fallback={<div>Loading Students...</div>}>
            <StudentsContent />
        </Suspense>
    );
}
