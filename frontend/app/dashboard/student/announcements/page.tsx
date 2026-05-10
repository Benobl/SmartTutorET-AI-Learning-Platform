"use client"

import { announcementApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Bell, Search, Pin, Check, Eye, AlertTriangle, BookOpen, Building2, Globe, LayoutGrid, List, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { ModernDataTable } from "@/components/dashboards/student/modern-data-table"
import { Button } from "@/components/ui/button"

const categoryConfig: any = {
    all: { label: "All", icon: Globe, color: "sky" },
    academic: { label: "Academic", icon: BookOpen, color: "indigo" },
    administrative: { label: "Administrative", icon: Building2, color: "emerald" },
    urgent: { label: "Urgent", icon: AlertTriangle, color: "red" },
    general: { label: "General", icon: Bell, color: "amber" },
}

export default function StudentAnnouncements() {
    const [realAnnouncements, setRealAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<AnnouncementCategory | "all">("all")
    const [viewMode, setViewMode] = useState<"card" | "table">("card")
    const [searchQuery, setSearchQuery] = useState("")
    const [readState, setReadState] = useState<Record<string, boolean>>({})

    useEffect(() => {
        loadAnnouncements()
    }, [])

    const loadAnnouncements = async () => {
        try {
            setLoading(true)
            const res = await announcementApi.getAll()
            setRealAnnouncements(res.data || [])
            
            // Initialize read state from localStorage or default
            const saved = localStorage.getItem("read_announcements")
            if (saved) setReadState(JSON.parse(saved))
        } catch (error) {
            console.error("Failed to load announcements", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleRead = (id: string) => {
        const newState = { ...readState, [id]: !readState[id] }
        setReadState(newState)
        localStorage.setItem("read_announcements", JSON.stringify(newState))
    }

    const filtered = realAnnouncements.filter((a) => {
        if (activeTab !== "all" && a.category !== activeTab) return false
        if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && !a.body.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const unreadCount = realAnnouncements.filter((a) => !readState[a._id]).length

    const columns = [
        {
            header: "Announcement",
            accessorKey: "title",
            cell: (ann: any) => (
                <div className="flex items-center gap-4 py-1">
                    {!readState[ann._id] && (
                        <div className="w-2 h-2 rounded-full bg-sky-500 shadow-lg shadow-sky-500/20 shrink-0" />
                    )}
                    <div className="min-w-0">
                        <p className={cn("font-black text-slate-900 truncate uppercase tracking-tight", readState[ann._id] && "text-slate-400 opacity-60")}>{ann.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{ann.body}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Category",
            accessorKey: "category",
            className: "text-center",
            cell: (ann: any) => (
                <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                    ann.category === "urgent" ? "bg-red-50 text-red-500 border-red-100" :
                        ann.category === "academic" ? "bg-indigo-50 text-indigo-500 border-indigo-100" :
                            ann.category === "administrative" ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                                "bg-amber-50 text-amber-500 border-amber-100"
                )}>
                    {ann.category}
                </span>
            )
        },
        {
            header: "Author",
            accessorKey: "createdBy",
            cell: (ann: any) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ann.createdBy?.name || "System"}</span>
        },
        {
            header: "Date",
            accessorKey: "createdAt",
            className: "text-right",
            cell: (ann: any) => <span className="text-[10px] font-black text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/5 blur-3xl rounded-full" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-8 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30" />
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Official Feed</span>
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                        Campus <span className="text-sky-500 italic">Announcements</span>
                        {unreadCount > 0 && (
                            <span className="ml-4 inline-flex items-center justify-center w-12 h-12 bg-sky-500 text-white text-xl font-black rounded-2xl shadow-lg shadow-sky-500/30 animate-bounce">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-lg">
                        Access critical updates, academic notices, and general campus news in one centralized hub.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <Input
                            placeholder="Search notices..."
                            className="bg-slate-50 border-slate-100 text-slate-900 pl-11 h-14 rounded-2xl focus:ring-sky-500/10 focus:bg-white focus:border-sky-300 transition-all font-bold uppercase text-[11px] tracking-widest"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-2">
                {/* Category Tabs */}
                <div className="flex bg-slate-100/80 p-1.5 rounded-[28px] border border-slate-200/50 backdrop-blur-md w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {(Object.keys(categoryConfig) as (AnnouncementCategory | "all")[]).map((cat) => {
                        const config = categoryConfig[cat]
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={cn(
                                    "flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
                                    activeTab === cat
                                        ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                )}
                            >
                                <config.icon className="w-4 h-4" />
                                {config.label}
                            </button>
                        )
                    })}
                </div>

                {/* View Switcher */}
                <div className="flex p-1.5 bg-slate-900 rounded-[28px] shadow-lg shadow-slate-900/10 shrink-0">
                    <button
                        onClick={() => setViewMode("card")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === "card" ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Cards
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === "table" ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        <List className="w-4 h-4" />
                        Advanced Table
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === "card" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-20 bg-white border border-slate-200 rounded-[48px] text-center shadow-xl shadow-slate-100/50">
                            <Bell className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Zero Broadcasts Found</h3>
                            <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto mt-2 italic opacity-70">
                                This category is currently empty. We'll broadcast updates here as they arrive!
                            </p>
                        </div>
                    ) : (
                        filtered.map((ann) => {
                            const isRead = readState[ann._id]
                            return (
                                <div
                                    key={ann._id}
                                    onClick={() => toggleRead(ann._id)}
                                    className={cn(
                                        "group p-8 rounded-[48px] border transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden",
                                        isRead
                                            ? "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-sky-100"
                                            : "bg-white border-slate-200 hover:border-sky-300 hover:shadow-2xl hover:-translate-y-1"
                                    )}
                                >
                                    <div className="flex items-start gap-6 relative z-10">
                                        <div className="mt-2 shrink-0">
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border-4 border-white shadow-md transition-all duration-1000",
                                                !isRead ? "bg-sky-500 animate-pulse scale-125" : "bg-slate-200"
                                            )} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    {ann.pinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500 shadow-xl" />}
                                                    <h4 className={cn(
                                                        "font-black text-xl tracking-tight leading-tight transition-colors transition-all duration-300",
                                                        isRead ? "text-slate-400" : "text-slate-900 group-hover:text-sky-600"
                                                    )}>
                                                        {ann.title}
                                                    </h4>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <span className={cn(
                                                "inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border mb-4 shadow-sm",
                                                ann.category === "urgent" ? "bg-red-50 text-red-500 border-red-100" :
                                                    ann.category === "academic" ? "bg-indigo-50 text-indigo-500 border-indigo-100" :
                                                        ann.category === "administrative" ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                                                            "bg-amber-50 text-amber-500 border-amber-100"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                                    ann.category === "urgent" ? "bg-red-500" :
                                                        ann.category === "academic" ? "bg-indigo-500" :
                                                            ann.category === "administrative" ? "bg-emerald-500" :
                                                                "bg-amber-500"
                                                )} />
                                                {ann.category}
                                            </span>

                                            <p className={cn(
                                                "text-sm leading-relaxed mb-8 font-medium italic",
                                                isRead ? "text-slate-400/60" : "text-slate-500"
                                            )}>
                                                {ann.body}
                                            </p>

                                            <div className="flex items-center justify-between pt-6 border-t border-slate-50/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ann.createdBy?.name || "System"}</span>
                                                </div>

                                                <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl bg-slate-50 text-slate-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                                                    {isRead ? "Re-read" : "Open Feed"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {!isRead && <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/5 blur-3xl rounded-full translate-y-10 group-hover:translate-y-0 transition-transform duration-1000" />}
                                </div>
                            )
                        })
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
                    <ModernDataTable
                        data={filtered.map(a => ({ ...a, id: a._id }))}
                        columns={columns}
                        onRowClick={(ann: any) => toggleRead(ann._id)}
                        searchPlaceholder="Filter news feed..."
                    />
                </div>
            )}
        </div>
    )
}
