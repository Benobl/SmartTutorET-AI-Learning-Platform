"use client"

import { useEffect, useState, useCallback } from "react"
import { gamificationApi } from "@/lib/api"
import { motion } from "framer-motion"
import { 
    Zap, 
    Star, 
    Award, 
    Crown,
    Shield,
    Target,
    Trophy
} from "lucide-react"
import { PremiumLeaderboard } from "@/components/gamification/PremiumLeaderboard"
import { Button } from "@/components/ui/button"

export default function StudentLeaderboardPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async () => {
        try {
            const res = await gamificationApi.getProfile()
            setProfile(res?.data || null)
        } catch (error) {
            console.error("Error fetching gamification profile:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const nextLevelXP = (lvl: number) => (lvl * lvl) * 50;
    const progressXP = profile?.xp || 0;
    const neededXP = nextLevelXP(profile?.level || 1);
    const progress = Math.min((progressXP / neededXP) * 100, 100);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 pt-8 px-4 sm:px-6">
            
            {/* HEADER SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 group"
                >
                    <div className="relative overflow-hidden rounded-[48px] p-8 md:p-12 border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -z-10" />
                        
                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-slate-900 flex flex-col items-center justify-center shadow-2xl border-4 border-white"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Level</span>
                                    <span className="text-6xl md:text-7xl font-black italic tracking-tighter text-white">{profile?.level || 1}</span>
                                </motion.div>
                                <div className="absolute -bottom-2 -right-2 bg-sky-600 p-4 rounded-2xl shadow-xl border-4 border-white">
                                    <Zap size={20} className="fill-white text-white" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Personal Ranking</span>
                                    </div>
                                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                                        Your <span className="font-semibold text-slate-900">Dominance</span>
                                    </h1>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        <span>Level Progression</span>
                                        <span className="text-slate-900 font-bold">{profile?.xp || 0} <span className="text-slate-300">/</span> {neededXP} XP</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-slate-900 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{profile?.currentStreak || 0} Day Streak</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                                        <Award size={16} className="text-sky-600" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{profile?.achievements?.length || 0} Badges Earned</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-4"
                >
                    <div className="h-full bg-white border border-slate-100 rounded-[48px] p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                            <Crown size={160} className="text-slate-900" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <Trophy className="text-amber-500" size={20} />
                                <h2 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">Hall of Fame</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                {profile?.achievements?.slice(0, 4).map((ach: any) => (
                                    <div key={ach.id} className="bg-slate-50 p-6 rounded-[32px] border border-transparent flex flex-col items-center justify-center text-center group/item hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-300">
                                        <span className="text-4xl mb-3 group-hover/item:scale-110 transition-transform">{ach.icon}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{ach.name}</span>
                                    </div>
                                ))}
                                {(!profile?.achievements || profile.achievements.length === 0) && (
                                    <div className="col-span-2 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-[32px]">
                                        <Target className="w-10 h-10 text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No badges unlocked</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* MAIN LEADERBOARD SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8">
                    <PremiumLeaderboard />
                </div>
                
                <div className="lg:col-span-4 space-y-12">
                    {/* Daily Missions */}
                    <div className="bg-white border border-slate-100 rounded-[48px] p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-50 rounded-full blur-3xl -z-10" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">Daily Vault</h3>
                            <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center border border-yellow-100">
                                <Zap className="text-yellow-500 fill-yellow-500 w-4 h-4" />
                            </div>
                        </div>
                        <div className="space-y-8">
                            {(profile?.dailyMissions || []).map((mission: any) => (
                                <div key={mission.id} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className={`font-black text-[11px] uppercase tracking-tight ${mission.isCompleted ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {mission.title}
                                            </h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Reward: <span className="text-sky-600">+{mission.xpReward} XP</span>
                                            </p>
                                        </div>
                                        <span className="text-[11px] font-black text-slate-900 tabular-nums">
                                            {mission.progress} / {mission.target}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                                            className={`h-full ${mission.isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-900'}`} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Season Banner */}
                    <div className="relative group overflow-hidden rounded-[48px] bg-slate-900 p-10 text-white shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <Zap size={180} className="fill-white" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-sky-400">
                                    Active Season
                                </div>
                                <h3 className="text-4xl font-black italic tracking-tighter leading-none uppercase">Season 01<br/>Legends</h3>
                                <p className="text-slate-400 text-[13px] font-medium leading-relaxed">
                                    Climb to the top of the Global Leaderboard to unlock legendary badges and platform-wide recognition.
                                </p>
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-white/5">
                                View Season Rewards
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
