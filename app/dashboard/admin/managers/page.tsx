"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCog, ShieldCheck, Mail, Eye, Trash2, Plus, UserPlus } from "lucide-react";
import { filterManagers } from "@/lib/admin-utils";
import { adminManagerList } from "@/lib/admin-mock-data";

export default function AdminManagersPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [statusFilter, setStatusFilter] = useState("All Status");

    const [managers, setManagers] = useState(filterManagers(query, statusFilter));
    const [isAppointing, setIsAppointing] = useState(false);
    const [managerToDelete, setManagerToDelete] = useState<any>(null);
    const [viewingManager, setViewingManager] = useState<any>(null);

    const handleViewProfile = (name: string, dept: string) => {
        setViewingManager({ name, dept });
    };

    const handleDeleteManager = (id: string, name: string) => {
        setManagerToDelete({ id, name });
    };

    const confirmDelete = () => {
        if (managerToDelete) {
            setManagers(prev => prev.filter(m => m.id !== managerToDelete.id));
            setManagerToDelete(null);
        }
    };

    const handleAppointManager = () => {
        setIsAppointing(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Institutional <span className="text-blue-500">Managers</span></h2>
                    <p className="text-slate-400 font-medium">Oversee personnel responsible for registry and operations.</p>
                </div>
                <Button
                    onClick={handleAppointManager}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 group transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                    Appoint Manager
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managers.map((manager) => (
                    <Card key={manager.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[32px] overflow-hidden bg-white group border border-slate-100 hover:-translate-y-1">
                        <CardHeader className="p-8 pb-4 relative">
                            <div className="absolute top-8 right-8">
                                <Badge className={`text-[9px] font-black rounded-lg px-2.5 py-1 uppercase tracking-widest shadow-sm ${manager.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    {manager.status}
                                </Badge>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-2xl font-black text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500 mb-6">
                                {manager.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <CardTitle className="text-xl font-black text-slate-800 mb-1">{manager.name}</CardTitle>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                {manager.department}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between text-xs font-bold px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-slate-400 uppercase tracking-widest">Managed Tutors</span>
                                    <span className="text-blue-600 font-black">{manager.managedTutors}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 px-1 py-1">
                                    {manager.permissions.map((perm, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-indigo-50/50 text-indigo-500 border-indigo-100 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            {perm}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleViewProfile(manager.name, manager.department)}
                                    className="flex-1 rounded-xl h-11 border-slate-100 text-slate-400 hover:text-blue-500 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-2" />
                                    Profile
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDeleteManager(manager.id, manager.name)}
                                    className="w-11 h-11 p-0 rounded-xl border-slate-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Add Professional Card Placeholder */}
                <button
                    onClick={handleAppointManager}
                    className="border-4 border-dashed border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-100 hover:bg-blue-50/20 transition-all duration-500 group min-h-[350px]"
                >
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:bg-white group-hover:text-blue-500 transition-all shadow-sm">
                        <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-slate-800 text-lg">Appoint Associate</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Expansion Slot Available</p>
                    </div>
                </button>
            </div>

            {/* Appointment Modal */}
            {isAppointing && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg border-0 shadow-2xl rounded-[40px] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-3xl font-black text-slate-900">Appoint <span className="text-blue-600">Manager</span></CardTitle>
                            <CardDescription className="text-slate-500 font-bold mt-2">Grant administrative override permissions to a new institutional lead.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-4 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Candidate Full Name</label>
                                    <input type="text" placeholder="e.g. Dr. Meron Tesfale" className="w-full h-14 rounded-2xl bg-slate-50 border-slate-100 px-6 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Department</label>
                                    <select className="w-full h-14 rounded-2xl bg-slate-50 border-slate-100 px-6 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border appearance-none">
                                        <option>Academic Registry</option>
                                        <option>Student Affairs</option>
                                        <option>Quality Assurance</option>
                                        <option>Operations</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20" onClick={() => setIsAppointing(false)}>
                                    Confirm Appointment
                                </Button>
                                <Button variant="ghost" className="h-14 px-6 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest" onClick={() => setIsAppointing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Deletion Confirmation */}
            {managerToDelete && (
                <div className="fixed inset-0 bg-rose-900/20 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-0 shadow-2xl rounded-[40px] overflow-hidden bg-white">
                        <CardContent className="p-10 text-center space-y-8">
                            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">Revoke Access?</h3>
                                <p className="text-slate-500 font-medium">You are about to remove <span className="text-slate-900 font-black">{managerToDelete.name}</span> from the institutional hub. This action cannot be undone.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20" onClick={confirmDelete}>
                                    Revoke Access
                                </Button>
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest" onClick={() => setManagerToDelete(null)}>
                                    Keep
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Profile Drawer-ish */}
            {viewingManager && (
                <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[100] border-l border-slate-100 p-10 animate-in slide-in-from-right duration-500 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <Badge className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Manager Dossier</Badge>
                        <Button variant="ghost" size="icon" onClick={() => setViewingManager(null)} className="rounded-full hover:bg-slate-100">
                            <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                        </Button>
                    </div>
                    <div className="space-y-12 flex-1">
                        <div className="space-y-6">
                            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                                {viewingManager.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{viewingManager.name}</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{viewingManager.dept}</p>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <div className="p-6 rounded-3xl bg-slate-50 space-y-1 border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact</p>
                                <p className="text-slate-900 font-black">{viewingManager.name.toLowerCase().replace(' ', '.') + '@smarttutor.edu'}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-slate-50 space-y-1 border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Tenure</p>
                                <p className="text-slate-900 font-black">2 Years, 4 Months</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
