"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Flame, Target, Star, Award, Zap, TrendingUp, Shield, Crown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { gamificationApi } from "@/lib/api"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

export default function GamificationDashboard() {
    const [profile, setProfile] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchGamificationData = async () => {
            try {
                const [profRes, leadRes] = await Promise.all([
                    gamificationApi.getProfile(),
                    gamificationApi.getLeaderboard()
                ])
                setProfile(profRes.data)
                setLeaderboard(leadRes.data || [])
            } catch (error) {
                console.error("Failed to fetch gamification data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchGamificationData()
    }, [])

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#0ea5e9', '#f59e0b', '#10b981']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#0ea5e9', '#f59e0b', '#10b981']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Trophy className="w-12 h-12 text-amber-500 animate-bounce" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Trophy Room...</p>
                </div>
            </div>
        )
    }

    const currentLevelXP = Math.pow((profile.level - 1), 2) * 50
    const nextLevelXP = Math.pow(profile.level, 2) * 50
    const progressPercent = ((profile.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

    return (
        <div className="p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-100/40 to-rose-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100 italic">Hall of Fame</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight italic">
                        Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">Trophy Room</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg italic">Complete daily missions, maintain your learning streak, and earn XP to rank up on the global leaderboard.</p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="relative group cursor-pointer" onClick={triggerConfetti}>
                        <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 group-hover:scale-105 transition-transform border-4 border-white">
                            <span className="text-6xl font-black text-white italic drop-shadow-md">{profile.level}</span>
                        </div>
                        <div className="absolute -bottom-4 -translate-x-1/2 left-1/2 px-4 py-1.5 bg-slate-900 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg whitespace-nowrap">
                            Level Status
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Progress & Missions (Col 1 & 2) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Level Progress */}
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                                <Zap className="w-6 h-6 text-sky-500" />
                                Neural Progression
                            </h3>
                            <span className="text-sm font-black text-slate-900 italic">{profile.xp} <span className="text-[10px] text-slate-400 uppercase">/ {nextLevelXP} XP</span></span>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="h-6 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100 relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full relative overflow-hidden" 
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full" />
                                </motion.div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right italic">{Math.round(nextLevelXP - profile.xp)} XP to Level {profile.level + 1}</p>
                        </div>
                    </div>

                    {/* Daily Missions */}
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                                <Target className="w-6 h-6 text-rose-500" />
                                Daily Directives
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                                {profile.dailyMissions.filter((m:any) => m.isCompleted).length} / {profile.dailyMissions.length} Complete
                            </span>
                        </div>

                        <div className="space-y-4">
                            {profile.dailyMissions.map((mission: any) => (
                                <div key={mission.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-sky-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors",
                                            mission.isCompleted ? "bg-emerald-500 text-white" : "bg-white text-slate-400 group-hover:text-sky-500"
                                        )}>
                                            {mission.isCompleted ? <Star className="w-6 h-6 fill-current" /> : <Target className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className={cn("text-sm font-black italic tracking-tight", mission.isCompleted ? "text-slate-400 line-through" : "text-slate-900")}>
                                                {mission.title}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Reward: <span className="text-amber-500">+{mission.xpReward} XP</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-slate-900 italic">{mission.progress} <span className="text-[12px] text-slate-400">/ {mission.target}</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                </div>

                {/* Leaderboard (Col 3) */}
                <div className="space-y-8">
                    
                    {/* Streak Card */}
                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                            <Flame className="w-48 h-48" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-center h-full">
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100 mb-2 italic">Learning Momentum</p>
                            <h3 className="text-5xl font-black tracking-tighter italic mb-4">
                                {profile.currentStreak} <span className="text-xl">Days</span>
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                                <Award className="w-4 h-4" />
                                Best: {profile.longestStreak} Days
                            </div>
                        </div>
                    </div>

                    {/* Global Leaderboard */}
                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-xl space-y-6 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <Crown className="w-6 h-6 text-amber-400" />
                            <h3 className="text-xl font-black tracking-tight italic">Global Rankings</h3>
                        </div>

                        <div className="space-y-4">
                            {leaderboard.map((entry, idx) => (
                                <div key={entry._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-inner",
                                            idx === 0 ? "bg-amber-400 text-amber-900" :
                                            idx === 1 ? "bg-slate-300 text-slate-800" :
                                            idx === 2 ? "bg-amber-700 text-amber-100" :
                                            "bg-slate-800 text-slate-400"
                                        )}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold tracking-tight">{entry.user?.name || "Anonymous Scholar"}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lvl {entry.level}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-sky-400 italic">{entry.xp} XP</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
