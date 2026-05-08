"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, Mail, UserCheck, Shield, Trash2, Edit3, MoreHorizontal } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function UsersContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) return;
        try {
            await adminApi.deleteUser(id);
            toast({ title: "User Purged", description: "Entity removed from global registry." });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleVerifyUser = async (id: string) => {
        try {
            await adminApi.updateUser(id, { isVerified: true });
            toast({ title: "User Verified", description: "Identity validation completed." });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
        setIsEditing(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        try {
            await adminApi.updateUser(selectedUser._id, editForm);
            toast({ title: "Record Updated", description: "User details synchronized successfully." });
            setIsEditing(false);
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Global <span className="text-sky-500">Directory</span></h2>
                    <p className="text-slate-400 font-medium">Manage every authenticated entity on the SmartTutor platform.</p>
                </div>
                <div className="flex gap-3">
                     <Badge className="bg-sky-50 text-sky-600 border-sky-100 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px]">
                        {users.length} Total Users
                     </Badge>
                </div>
            </div>

            <Card className="border-0 shadow-xl rounded-[40px] overflow-hidden bg-white border-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <Users className="w-5 h-5 text-sky-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tighter">Unified Registry</CardTitle>
                                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Master record of all platform participants</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/20">
                                    {["Identity", "Role", "Verification", "Registered", "Actions"].map((h) => (
                                        <th key={h} className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="py-8 px-8"><div className="h-4 bg-slate-100 rounded-full w-full" /></td>
                                    </tr>
                                ))}
                                {!loading && filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                                                    {user.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-tight">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge className={cn("text-[9px] font-black rounded-lg px-2.5 py-1 uppercase tracking-widest border-0 shadow-sm", 
                                                user.role === 'admin' ? "bg-rose-50 text-rose-500" :
                                                user.role === 'manager' ? "bg-violet-50 text-violet-500" :
                                                user.role === 'tutor' ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                                            )}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", user.isVerified ? "bg-emerald-500" : "bg-slate-300")} />
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", user.isVerified ? "text-emerald-500" : "text-slate-400")}>
                                                    {user.isVerified ? "Verified" : "Unverified"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100">
                                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-slate-100 shadow-xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 p-2">Operations</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleVerifyUser(user._id)} className="rounded-xl font-bold p-3 text-emerald-600 focus:bg-emerald-50 cursor-pointer">
                                                        <UserCheck className="w-4 h-4 mr-2" />
                                                        Verify Identity
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditClick(user)} className="rounded-xl font-bold p-3 text-slate-600 focus:bg-slate-50 cursor-pointer">
                                                        <Edit3 className="w-4 h-4 mr-2" />
                                                        Modify Record
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-50 mx-2 my-1" />
                                                    <DropdownMenuItem onClick={() => handleDeleteUser(user._id, user.name)} className="rounded-xl font-bold p-3 text-rose-500 focus:bg-rose-50 cursor-pointer">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Purge Entity
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-[40px] overflow-hidden bg-white">
                    <DialogHeader className="p-4">
                        <DialogTitle className="text-2xl font-black text-slate-900">Modify <span className="text-sky-500">Registry Record</span></DialogTitle>
                        <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-2">Updating entity metadata for {selectedUser?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 p-4 pt-0">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Name</Label>
                            <Input 
                                value={editForm.name} 
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="h-12 rounded-xl border-slate-100 font-bold" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Access</Label>
                            <Input 
                                value={editForm.email} 
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                className="h-12 rounded-xl border-slate-100 font-bold" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Platform Role</Label>
                            <Select 
                                value={editForm.role} 
                                onValueChange={(val) => setEditForm({...editForm, role: val})}
                            >
                                <SelectTrigger className="h-12 rounded-xl border-slate-100 font-bold">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {["student", "tutor", "manager", "admin"].map(role => (
                                        <SelectItem key={role} value={role} className="font-bold uppercase text-[10px] tracking-widest">{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button 
                            onClick={handleUpdateUser}
                            className="w-full h-14 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-sky-500/20"
                        >
                            Sync Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense fallback={<div>Syncing Registry...</div>}>
            <UsersContent />
        </Suspense>
    );
}
