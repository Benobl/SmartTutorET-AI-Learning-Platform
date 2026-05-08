"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCog, ShieldCheck, Mail, Eye, Trash2, Plus, UserPlus, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ManagersContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    
    const [managers, setManagers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAppointing, setIsAppointing] = useState(false);
    const [managerToDelete, setManagerToDelete] = useState<any>(null);
    const [viewingManager, setViewingManager] = useState<any>(null);
    const [managerEmail, setManagerEmail] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            // Filter only admins and managers
            const adminList = res.data.filter((u: any) => u.role === "admin" || u.role === "manager");
            setManagers(adminList);
        } catch (error) {
            console.error("Failed to fetch managers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewProfile = (manager: any) => {
        setViewingManager(manager);
    };

    const handleDeleteManager = (manager: any) => {
        setManagerToDelete(manager);
    };

    const confirmDelete = async () => {
        if (managerToDelete) {
            try {
                await adminApi.deleteUser(managerToDelete._id);
                toast({ title: "Access Revoked", description: `${managerToDelete.name} has been removed.` });
                setManagerToDelete(null);
                fetchData();
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        }
    };

    const handleAppointManager = async () => {
        if (!managerEmail) return;
        try {
            await adminApi.appointManager(managerEmail);
            toast({ title: "Success", description: "User promoted to Manager." });
            setIsAppointing(false);
            setManagerEmail("");
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Filter by search query
    const filteredManagers = managers.filter(m => 
        m.name?.toLowerCase().includes(query.toLowerCase()) ||
        m.email?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Institutional <span className="text-blue-500">Managers</span></h2>
                    <p className="text-slate-400 font-medium">Oversee personnel responsible for registry and operations.</p>
                </div>
                <Button
                    onClick={() => setIsAppointing(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 group transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                    Appoint Manager
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredManagers.map((manager) => (
                    <Card key={manager._id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[32px] overflow-hidden bg-white group border border-slate-100 hover:-translate-y-1">
                        <CardHeader className="p-8 pb-4 relative">
                            <div className="absolute top-8 right-8">
                                <Badge className={`text-[9px] font-black rounded-lg px-2.5 py-1 uppercase tracking-widest shadow-sm ${manager.isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                    {manager.isVerified ? 'Active' : 'Pending'}
                                </Badge>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-2xl font-black text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500 mb-6">
                                {manager.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </div>
                            <CardTitle className="text-xl font-black text-slate-800 mb-1">{manager.name}</CardTitle>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                {manager.role === 'admin' ? 'Strategic Admin' : 'Registry Ops'}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between text-xs font-bold px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="text-slate-400 uppercase tracking-widest">Email Access</span>
                                    <span className="text-blue-600 font-black truncate max-w-[150px]">{manager.email}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 px-1 py-1">
                                    {['registry', 'monitoring', 'users'].map((perm, idx) => (
                                        <Badge key={idx} variant="secondary" className="bg-indigo-50/50 text-indigo-500 border-indigo-100 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            {perm}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleViewProfile(manager)}
                                    className="flex-1 rounded-xl h-11 border-slate-100 text-slate-400 hover:text-blue-500 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-2" />
                                    Profile
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDeleteManager(manager)}
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
                    onClick={() => setIsAppointing(true)}
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
            <Dialog open={isAppointing} onOpenChange={setIsAppointing}>
                <DialogContent className="sm:max-w-[425px] border-0 shadow-2xl rounded-[40px] overflow-hidden bg-white">
                    <DialogHeader className="p-4">
                        <DialogTitle className="text-3xl font-black text-slate-900">Appoint <span className="text-blue-600">Manager</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold mt-2">Grant administrative override permissions to a new lead.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 p-4 pt-0">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Candidate Email Address</label>
                            <Input 
                                type="email" 
                                placeholder="email@example.com" 
                                value={managerEmail}
                                onChange={(e) => setManagerEmail(e.target.value)}
                                className="w-full h-14 rounded-2xl bg-slate-50 border-slate-100 px-6 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border" 
                            />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <Button 
                                className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20" 
                                onClick={handleAppointManager}
                            >
                                Confirm Appointment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Deletion Confirmation */}
            <Dialog open={!!managerToDelete} onOpenChange={() => setManagerToDelete(null)}>
                <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-[40px] overflow-hidden bg-white p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Confirm Revocation</DialogTitle>
                    </DialogHeader>
                    <div className="p-10 text-center space-y-8">
                        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 leading-tight">Revoke Access?</h3>
                            <p className="text-slate-500 font-medium">You are about to remove <span className="text-slate-900 font-black">{managerToDelete?.name}</span>. This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20" onClick={confirmDelete}>
                                Revoke Access
                            </Button>
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest" onClick={() => setManagerToDelete(null)}>
                                Keep
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Profile Drawer-ish */}
            {viewingManager && (
                <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[100] border-l border-slate-100 p-10 animate-in slide-in-from-right duration-500 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <Badge className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Manager Dossier</Badge>
                        <Button variant="ghost" size="icon" onClick={() => setViewingManager(null)} className="rounded-full hover:bg-slate-100">
                            <X className="w-6 h-6 text-slate-400" />
                        </Button>
                    </div>
                    <div className="space-y-12 flex-1">
                        <div className="space-y-6">
                            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                                {viewingManager.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{viewingManager.name}</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{viewingManager.role}</p>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <div className="p-6 rounded-3xl bg-slate-50 space-y-1 border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact</p>
                                <p className="text-slate-900 font-black">{viewingManager.email}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-slate-50 space-y-1 border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</p>
                                <p className="text-slate-900 font-black">{new Date(viewingManager.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminManagersPage() {
    return (
        <Suspense fallback={<div>Loading Managers...</div>}>
            <ManagersContent />
        </Suspense>
    );
}
