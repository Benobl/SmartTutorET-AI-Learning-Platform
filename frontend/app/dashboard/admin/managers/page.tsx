"use client";

import { useState, useEffect } from "react";
import { 
    Shield, Search, RefreshCw, UserPlus, Trash2, Eye, X,
    CheckCircle2, Users, Crown, Mail, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export default function AdminManagersPage() {
    const [managers, setManagers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAppointing, setIsAppointing] = useState(false);
    const [managerEmail, setManagerEmail] = useState("");
    const [appointing, setAppointing] = useState(false);
    const [managerToDelete, setManagerToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const [viewingManager, setViewingManager] = useState<any>(null);

    const fetchManagers = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            const allUsers = res?.data || [];
            setManagers(allUsers.filter((u: any) => u.role === "manager" || u.role === "admin"));
        } catch (error) {
            toast({ title: "Fetch Error", description: "Could not load managers.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchManagers(); }, []);

    const handleAppointManager = async () => {
        if (!managerEmail.trim()) return;
        setAppointing(true);
        try {
            await adminApi.appointManager(managerEmail.trim());
            toast({ title: "Manager Appointed ✓", description: `${managerEmail} is now a Manager.`, className: "bg-emerald-500 text-white" });
            setIsAppointing(false);
            setManagerEmail("");
            fetchManagers();
        } catch (error: any) {
            toast({ title: "Appointment Failed", description: error.message, variant: "destructive" });
        } finally {
            setAppointing(false);
        }
    };

    const confirmDelete = async () => {
        if (!managerToDelete) return;
        setDeleting(true);
        try {
            await adminApi.deleteUser(managerToDelete._id);
            toast({ title: "Access Revoked", description: `${managerToDelete.name} has been removed.` });
            setManagerToDelete(null);
            fetchManagers();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setDeleting(false);
        }
    };

    const filteredManagers = managers.filter(m =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const adminCount = managers.filter(m => m.role === "admin").length;
    const managerCount = managers.filter(m => m.role === "manager").length;

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Administrative Team</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Managers &amp; <span className="font-semibold text-slate-900">Admins</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Manage platform administrators and operations managers.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={fetchManagers}
                        variant="outline"
                        className="rounded-2xl h-12 px-5 border-slate-100 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all text-slate-500"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                    <Button
                        onClick={() => setIsAppointing(true)}
                        className="rounded-2xl h-12 px-7 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-200 transition-all"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Appoint Manager
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-4">
                {[
                    { label: "Total Personnel", value: managers.length, icon: Users, color: "sky" },
                    { label: "Administrators", value: adminCount, icon: Crown, color: "indigo" },
                    { label: "Managers", value: managerCount, icon: Shield, color: "emerald" },
                ].map((stat, i) => (
                    <div key={i} className="p-7 rounded-[24px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-md transition-all duration-200 flex items-center gap-5">
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            stat.color === "sky" ? "bg-sky-50 text-sky-500" :
                            stat.color === "indigo" ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"
                        )}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stat.value}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="px-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 pb-24">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-[28px]" />
                    ))
                ) : filteredManagers.length === 0 ? (
                    <div className="col-span-3 py-20 text-center">
                        <Shield className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No managers found</p>
                    </div>
                ) : (
                    <>
                        {filteredManagers.map((manager) => (
                            <div
                                key={manager._id}
                                className="p-7 rounded-[28px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-lg transition-all duration-200 group space-y-5"
                            >
                                {/* Avatar + role */}
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-xl font-black text-sky-600 group-hover:scale-105 transition-transform">
                                        {manager.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                        manager.role === "admin"
                                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    )}>
                                        {manager.role}
                                    </span>
                                </div>

                                {/* Name */}
                                <div>
                                    <p className="text-base font-bold text-slate-900">{manager.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                        <Mail className="w-3 h-3" />
                                        <span className="text-xs truncate">{manager.email}</span>
                                    </div>
                                </div>

                                {/* Joined */}
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-[10px]">
                                        Joined {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", manager.accountStatus === "active" || !manager.accountStatus ? "bg-emerald-400" : "bg-slate-300")} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {manager.accountStatus || "active"}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setViewingManager(manager)}
                                        className="flex-1 rounded-xl h-9 border-slate-100 text-slate-400 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-100 font-black text-[9px] uppercase tracking-widest transition-all"
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                        View
                                    </Button>
                                    {manager.role !== "admin" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setManagerToDelete(manager)}
                                            className="w-9 h-9 p-0 rounded-xl border-slate-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add Slot */}
                        <button
                            onClick={() => setIsAppointing(true)}
                            className="min-h-[260px] rounded-[28px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 hover:border-sky-200 hover:bg-sky-50/30 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:text-sky-500 text-slate-300 flex items-center justify-center transition-all border border-slate-100 group-hover:border-sky-200 group-hover:shadow-sm">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-500 group-hover:text-slate-700">Appoint Manager</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Add new personnel</p>
                            </div>
                        </button>
                    </>
                )}
            </div>

            {/* Appoint Manager Dialog */}
            <Dialog open={isAppointing} onOpenChange={setIsAppointing}>
                <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-[32px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                            Appoint <span className="text-sky-500">Manager</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            Enter the email of an existing user to promote them to Manager, or create a new manager account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                            <Input
                                type="email"
                                placeholder="manager@example.com"
                                value={managerEmail}
                                onChange={e => setManagerEmail(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAppointManager()}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-medium focus:ring-sky-500/20"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                className="flex-1 h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-200"
                                onClick={handleAppointManager}
                                disabled={appointing || !managerEmail.trim()}
                            >
                                {appointing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                {appointing ? "Appointing..." : "Confirm"}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest"
                                onClick={() => { setIsAppointing(false); setManagerEmail(""); }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!managerToDelete} onOpenChange={() => setManagerToDelete(null)}>
                <DialogContent className="sm:max-w-sm border-0 shadow-2xl rounded-[32px] bg-white">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Confirm Removal</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Remove Manager?</h3>
                            <p className="text-slate-400 text-sm mt-2">
                                You are about to remove <strong className="text-slate-700">{managerToDelete?.name}</strong> from administrative access. This cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Removing..." : "Remove"}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest"
                                onClick={() => setManagerToDelete(null)}
                            >
                                Keep
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Profile Side Panel */}
            {viewingManager && (
                <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[100] border-l border-slate-100 p-8 animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <span className={cn(
                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                            viewingManager.role === "admin"
                                ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                            {viewingManager.role}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingManager(null)}
                            className="rounded-xl hover:bg-slate-100 text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="space-y-8 flex-1">
                        <div>
                            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-2xl font-black text-white shadow-xl mb-5">
                                {viewingManager.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{viewingManager.name}</h3>
                            <p className="text-slate-400 text-sm mt-1">{viewingManager.email}</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: "Role", value: viewingManager.role },
                                { label: "Status", value: viewingManager.accountStatus || "active" },
                                { label: "Joined", value: viewingManager.createdAt ? new Date(viewingManager.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—" },
                                { label: "Verified", value: viewingManager.isVerified ? "Yes" : "No" },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                                    <span className="text-sm font-bold text-slate-700 capitalize">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
