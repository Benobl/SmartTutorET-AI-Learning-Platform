"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Shield } from "lucide-react";
import { filterUsers } from "@/lib/admin-utils";

export default function AdminUsersPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [statusFilter, setStatusFilter] = useState("All Status");

    const filteredUsers = filterUsers(query, roleFilter, statusFilter);

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl border-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">User Management</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Manage platform users and their access levels</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="text-xs font-black px-4 py-2.5 rounded-xl border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                            >
                                {["All Roles", "Student", "Tutor", "Admin", "Manager"].map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-xs font-black px-4 py-2.5 rounded-xl border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                            >
                                {["All Status", "Active", "Inactive", "Suspended"].map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    {["User", "Role", "Status", "Joined", "Focus", "Actions"].map((h) => (
                                        <th key={h} className="text-left py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                                                    <p className="text-xs text-slate-400 font-bold mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge variant="outline" className="text-[10px] font-black rounded-lg bg-slate-50 text-slate-500 border-slate-200 px-2.5 py-1 uppercase tracking-wider">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge
                                                className={`text-[10px] font-black rounded-lg px-2.5 py-1 uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                                    user.status === 'Suspended' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                                                        'bg-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8 text-xs text-slate-500 font-bold">{user.joined}</td>
                                        <td className="py-5 px-8 text-xs text-slate-500 font-black">
                                            {user.grade ? `Grade ${user.grade}` : user.subject || '-'}
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                                                    <Shield className="w-4 h-4" />
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
