"use client"

import { useEffect, useState, useCallback } from "react"
import { userApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth-utils"
import { cn } from "@/lib/utils"
import { 
    Trophy, 
    Medal, 
    Crown, 
    Loader2, 
    TrendingUp, 
    Target, 
    Zap,
    Users,
    ChevronRight,
    Star
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function LeaderboardPage() {
    const user = getCurrentUser()
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGrade, setSelectedGrade] = useState(user?.grade || "12")

    const fetchLeaderboard = useCallback(async () => {
        try {
            setLoading(true)
            const res = await userApi.getLeaderboard(selectedGrade)
            setLeaderboard(res.data || [])
        } catch (error) {
            console.error("Failed to load leaderboard:", error)
        } finally {
            setLoading(false)
        }
    }, [selectedGrade])

    useEffect(() => {
        fetchLeaderboard()
    }, [fetchLeaderboard])

    const topThree = leaderboard.slice(0, 3)
    const others = leaderboard.slice(3)

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100">Hall of Fame</span>
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Grade <span className='text-amber-500'>{selectedGrade}</span> <span className="italic">Elite</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Celebrating academic excellence and persistent engagement across the grade.
                        </p>
                    </div>

                    <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1 w-fit">
                        {["9", "10", "11", "12"].map((grade) => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={cn(
                                    "h-12 px-6 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                    selectedGrade === grade
                                        ? "bg-white text-amber-600 shadow-xl shadow-amber-500/10 border border-amber-100"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                )}
                            >
                                Grade {grade}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                     <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Participants</p>
                            <p className="text-xl font-black text-slate-900 leading-none mt-1">{leaderboard.length}+</p>
                        </div>
                     </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Calculating Ranks...</p>
                </div>
            ) : leaderboard.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200">
                    <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight">No rankings yet</h3>
                    <p className="text-slate-400 text-sm font-medium mt-2">Evaluations are in progress. Check back soon!</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Podiums */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-10">
                        {/* 2nd Place */}
                        <div className="order-2 md:order-1 h-full flex flex-col justify-end">
                            {topThree[1] && (
                                <div className="p-8 rounded-[48px] bg-white border border-slate-100 shadow-xl relative text-center group hover:-translate-y-2 transition-all duration-700">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <Avatar className="w-20 h-20 border-4 border-slate-100 shadow-2xl">
                                                <AvatarImage src={topThree[1].avatar} />
                                                <AvatarFallback className="bg-slate-200 text-slate-500 font-black">
                                                    {topThree[1].name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center shadow-lg">
                                                <Medal className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <h3 className="text-xl font-black text-slate-900 truncate uppercase">{topThree[1].name.split(' ')[0]}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Silver Achiever</p>
                                        <div className="mt-6 pt-6 border-t border-slate-50">
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{topThree[1].totalPoints} pts</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 1st Place */}
                        <div className="order-1 md:order-2">
                            {topThree[0] && (
                                <div className="p-10 rounded-[56px] bg-slate-900 border border-slate-800 shadow-2xl relative text-center group hover:-translate-y-4 transition-all duration-1000 scale-110">
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                                                <Crown className="w-12 h-12 fill-amber-500" />
                                            </div>
                                            <Avatar className="w-28 h-28 border-4 border-amber-500 shadow-2xl shadow-amber-500/20">
                                                <AvatarImage src={topThree[0].avatar} />
                                                <AvatarFallback className="bg-slate-800 text-amber-500 font-black text-xl">
                                                    {topThree[0].name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border-4 border-slate-900">
                                                <Trophy className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-black text-white truncate uppercase tracking-tight">{topThree[0].name.split(' ')[0]}</h3>
                                        <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                            <Zap className="w-3.5 h-3.5" /> Grade Champion
                                        </p>
                                        <div className="mt-8 pt-8 border-t border-white/10">
                                            <p className="text-4xl font-black text-white tracking-tighter">{topThree[0].totalPoints} pts</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3rd Place */}
                        <div className="order-3 h-full flex flex-col justify-end">
                            {topThree[2] && (
                                <div className="p-8 rounded-[48px] bg-white border border-slate-100 shadow-xl relative text-center group hover:-translate-y-2 transition-all duration-700">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <Avatar className="w-20 h-20 border-4 border-slate-100 shadow-2xl">
                                                <AvatarImage src={topThree[2].avatar} />
                                                <AvatarFallback className="bg-slate-200 text-slate-500 font-black">
                                                    {topThree[2].name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center shadow-lg">
                                                <Medal className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <h3 className="text-xl font-black text-slate-900 truncate uppercase">{topThree[2].name.split(' ')[0]}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Bronze Achiever</p>
                                        <div className="mt-6 pt-6 border-t border-slate-50">
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{topThree[2].totalPoints} pts</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table View for others */}
                    {others.length > 0 && (
                        <div className="bg-white rounded-[56px] border border-slate-100 shadow-xl overflow-hidden max-w-5xl mx-auto">
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <Users className="w-6 h-6 text-slate-400" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ascending Elites</h3>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" /> 
                                    Top 10 Performers
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                            <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</th>
                                            <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {others.map((student, idx) => (
                                            <tr key={student._id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-6">
                                                    <span className="text-2xl font-black text-slate-300 group-hover:text-slate-900 transition-colors italic">#{idx + 4}</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="w-12 h-12 border border-slate-100">
                                                            <AvatarImage src={student.avatar} />
                                                            <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{student.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Student</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                                                            <div 
                                                                className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-all duration-1000" 
                                                                style={{ width: `${Math.min(100, (student.totalPoints / topThree[0].totalPoints) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <p className="text-xl font-black text-slate-900 italic tracking-tighter">{student.totalPoints}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
