"use client"

import { useState, useEffect } from "react"
import { assignmentApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Trophy, Medal, Star, Loader2, UserCircle2 } from "lucide-react"

export function Leaderboard({ grade }: { grade: string }) {
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (grade) {
            loadLeaderboard()
        }
    }, [grade])

    const loadLeaderboard = async () => {
        try {
            setLoading(true)
            const res = await assignmentApi.getLeaderboard(grade)
            setLeaderboard(res.data || [])
        } catch (error) {
            console.error("Failed to load leaderboard", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Rankings...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Grade {grade} Champions</h2>
                <Trophy className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
            </div>

            <div className="space-y-4">
                {leaderboard.map((item, index) => {
                    const isTop3 = index < 3
                    const rankColors = [
                        "bg-amber-400", // Gold
                        "bg-slate-300", // Silver
                        "bg-orange-400" // Bronze
                    ]
                    return (
                        <div 
                            key={item._id} 
                            className={cn(
                                "relative p-5 rounded-[28px] border transition-all duration-500 group",
                                isTop3 ? "bg-white border-amber-100 shadow-xl shadow-amber-500/5 hover:-translate-y-1" : "bg-slate-50/50 border-slate-100"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                                        {item.avatar ? (
                                            <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle2 className="w-full h-full p-2 text-slate-300" />
                                        )}
                                    </div>
                                    {isTop3 && (
                                        <div className={cn(
                                            "absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg border-2 border-white",
                                            rankColors[index]
                                        )}>
                                            {index === 0 && <Star className="w-3 h-3 fill-white" />}
                                            {index === 1 && <Medal className="w-3 h-3 fill-white" />}
                                            {index === 2 && <Medal className="w-3 h-3 fill-white" />}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="font-black text-slate-900 uppercase tracking-tight text-xs">{item.studentName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.totalMarks} Total Points</p>
                                </div>

                                <div className="text-right">
                                    <span className={cn(
                                        "text-sm font-black italic",
                                        index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-orange-500" : "text-slate-300"
                                    )}>
                                        #{index + 1}
                                    </span>
                                </div>
                            </div>

                            {index === 0 && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 blur-3xl rounded-full -mr-10 -mt-10" />
                            )}
                        </div>
                    )
                })}

                {leaderboard.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No scores recorded yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
