"use client"

import { useState } from "react"
import { Users, Search, Filter, Mail, Calendar, Shield, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AdminManagementHubProps {
    initialTab: "students" | "tutors" | "users"
}

export function AdminManagementHub({ initialTab }: AdminManagementHubProps) {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                        {initialTab} <span className="text-sky-600">Registry</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                        System management and access control
                    </p>
                </div>
            </div>

            <Card className="rounded-[32px] border-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <Input 
                                placeholder={`Search ${initialTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 pl-12 rounded-2xl bg-white border-slate-200 font-bold text-xs shadow-sm"
                            />
                        </div>
                        <Button variant="outline" className="h-12 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest">
                            <Filter className="w-4 h-4 mr-2" /> Filter Results
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                            <Users className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-slate-900 uppercase">Synchronizing Data...</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading specialized administrative views</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
