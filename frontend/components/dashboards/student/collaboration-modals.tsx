"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Users, Link as LinkIcon, Plus, Copy,
    Check, Search, UserPlus, Zap,
    Video, Globe, ShieldCheck, Mail
} from "lucide-react"
import { cn } from "@/lib/utils"
import { friends } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

interface CollaborationModalsProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    type: "create" | "invite"
}

export function CollaborationModals({ isOpen, onOpenChange, type }: CollaborationModalsProps) {
    const { toast } = useToast()
    const [step, setStep] = useState(1)
    const [sessionName, setSessionName] = useState("")
    const [generatedLink, setGeneratedLink] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [invitedIds, setInvitedIds] = useState<number[]>([])

    const handleCreate = () => {
        setGeneratedLink(`meet.smarttutoret.com/${Math.random().toString(36).substring(7)}`)
        setStep(2)
        toast({
            title: "Session Created",
            description: "Your secure study link is ready.",
        })
    }

    const copyLink = () => {
        navigator.clipboard.writeText(generatedLink)
        toast({
            title: "Link Copied",
            description: "Share this link with your classmates.",
        })
    }

    const toggleInvite = (id: number) => {
        if (invitedIds.includes(id)) {
            setInvitedIds(prev => prev.filter(i => i !== id))
        } else {
            setInvitedIds(prev => [...prev, id])
        }
    }

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl bg-white rounded-[48px] p-0 overflow-hidden border-slate-200 shadow-2xl">
                {type === "create" ? (
                    <div className="flex flex-col h-full">
                        <DialogHeader className="p-10 pb-8 bg-gradient-to-br from-sky-600 to-indigo-700 text-white shrink-0">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <Video className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black tracking-tight leading-none uppercase">
                                        Establish <span className="text-sky-300">Hub</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-sky-100 font-bold mt-1 uppercase tracking-widest text-[10px] opacity-80">
                                        Launch a high-definition study session
                                    </DialogDescription>
                                </div>
                            </div>

                            {step === 2 && (
                                <div className="p-6 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/20 animate-in zoom-in-95 duration-500">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-60">Session Access Key</p>
                                    <div className="flex items-center gap-3">
                                        <code className="flex-1 bg-black/20 px-4 py-3 rounded-xl font-mono text-sm text-sky-200 overflow-hidden truncate">
                                            {generatedLink}
                                        </code>
                                        <Button onClick={copyLink} size="icon" className="h-12 w-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg">
                                            <Copy className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogHeader>

                        <div className="p-10 space-y-8">
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Identity</label>
                                        <Input
                                            placeholder="e.g. Calculus Final Prep Group"
                                            value={sessionName}
                                            onChange={(e) => setSessionName(e.target.value)}
                                            className="h-16 rounded-2xl border-slate-200 bg-slate-50 text-sm font-bold focus:ring-sky-500/10 focus:border-sky-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Privacy</p>
                                            <p className="text-xs font-bold text-slate-900">End-to-End Secure</p>
                                        </div>
                                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                                            <Globe className="w-5 h-5 text-sky-500" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latency</p>
                                            <p className="text-xs font-bold text-slate-900">Ultra-Low 4K Stream</p>
                                        </div>
                                    </div>
                                    <Button
                                        disabled={!sessionName}
                                        onClick={handleCreate}
                                        className="w-full h-16 rounded-[28px] bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-sky-500/30 gap-3"
                                    >
                                        Initialize Hub <Zap className="w-5 h-5 fill-sky-300 text-sky-300" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed text-center">
                                        Your session is live! You can now invite your friends or copy the link to share manually in groups.
                                    </p>
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => onOpenChange(false)}
                                            variant="outline"
                                            className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-500"
                                        >
                                            Dismiss Hub
                                        </Button>
                                        <Button
                                            className="flex-1 h-14 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-500/20"
                                        >
                                            Manage Invites
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <DialogHeader className="p-10 pb-8 shrink-0 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                        Invite <span className="text-sky-600">Squad</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                                        Add frequent collaborators to your session
                                    </DialogDescription>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
                                    <UserPlus className="w-7 h-7" />
                                </div>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                                <Input
                                    placeholder="Search by name or course..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-14 rounded-[22px] border-slate-200 bg-slate-50 font-bold text-sm pl-14 shadow-inner focus:ring-sky-500/10 focus:border-sky-500"
                                />
                            </div>
                        </DialogHeader>

                        <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                            {filteredFriends.map((friend) => (
                                <div key={friend.id} className="group p-4 rounded-3xl bg-white border border-slate-50 hover:border-sky-100 hover:shadow-xl transition-all duration-300 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                                {friend.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            {friend.online && <div className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />}
                                        </div>
                                        <div>
                                            <h5 className="font-black text-slate-900 text-sm leading-tight">{friend.name}</h5>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{friend.courses.join(', ')}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => toggleInvite(friend.id)}
                                        variant={invitedIds.includes(friend.id) ? "secondary" : "ghost"}
                                        className={cn(
                                            "h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all gap-2",
                                            invitedIds.includes(friend.id)
                                                ? "bg-sky-50 text-sky-600 border border-sky-100"
                                                : "text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                                        )}
                                    >
                                        {invitedIds.includes(friend.id) ? <><Check className="w-3.5 h-3.5" /> Invited</> : <><Plus className="w-3.5 h-3.5" /> Invite</>}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{invitedIds.length} Friends Selected</span>
                                <Button variant="ghost" onClick={() => setInvitedIds([])} className="text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 h-auto p-0 px-2">Clear All</Button>
                            </div>
                            <Button
                                disabled={invitedIds.length === 0}
                                onClick={() => {
                                    toast({ title: "Invites Sent", description: `Dispatched to ${invitedIds.length} collaborators.` })
                                    onOpenChange(false)
                                }}
                                className="w-full h-16 rounded-[28px] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200/50 gap-3"
                            >
                                Dispatch Invites <Mail className="w-5 h-5 text-sky-400" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
