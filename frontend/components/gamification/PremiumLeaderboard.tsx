"use client"

import { useEffect, useState } from "react"
import { gamificationApi } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    Trophy, 
    Zap, 
    Star, 
    TrendingUp, 
    TrendingDown, 
    Minus, 
    Medal,
    Target
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PremiumPodium } from "./PremiumPodium"

export function PremiumLeaderboard() {
    const [type, setType] = useState<'weekly' | 'semester' | 'all-time'>('weekly')
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        ;(async () => {
            try {
                setLoading(true)
                const res = await gamificationApi.getLeaderboard()
                // The API might return different types, for now we simulate or use the available data
                setData(res?.data || [])
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err)
            } finally {
                setLoading(false)
            }
        })()
    }, [type])

    const getXP = (entry: any) => {
        if (type === 'weekly') return entry.weeklyXP;
        if (type === 'semester') return entry.semesterXP;
        return entry.xp;
    }

    const getMovementBadge = (m: string) => {
        if (m === 'up') return <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase italic"><TrendingUp size={10} /> Up</div>
        if (m === 'down') return <div className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase italic"><TrendingDown size={10} /> Down</div>
        return <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase italic"><Minus size={10} /> Steady</div>
    }

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-6 bg-slate-900 rounded-full" />
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-3">
                            Global Hall of <span className="text-sky-600">Fame</span>
                        </h2>
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-5">The elite 1% of SmartTutorET</p>
                </div>

                <Tabs value={type} onValueChange={(v: any) => setType(v)} className="w-full md:w-auto">
                    <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-2xl h-14">
                        <TabsTrigger value="weekly" className="px-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-xl transition-all font-black text-xs uppercase tracking-widest">Weekly</TabsTrigger>
                        <TabsTrigger value="semester" className="px-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-xl transition-all font-black text-xs uppercase tracking-widest">Semester</TabsTrigger>
                        <TabsTrigger value="all-time" className="px-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-xl transition-all font-black text-xs uppercase tracking-widest">All-Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {loading ? (
                <div className="space-y-8 mt-12">
                    <div className="grid grid-cols-3 gap-8 h-64">
                        <Skeleton className="bg-slate-50 rounded-[40px] h-full border border-slate-100" />
                        <Skeleton className="bg-slate-50 rounded-[40px] h-full scale-110 border border-slate-100" />
                        <Skeleton className="bg-slate-50 rounded-[40px] h-full border border-slate-100" />
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-24 w-full bg-slate-50 rounded-[32px] border border-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="space-y-16">
                    {data.length > 0 && <PremiumPodium topThree={data.slice(0, 3)} type={type} />}

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {data.slice(3).map((entry, index) => (
                                <motion.div
                                    key={entry._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="group relative"
                                >
                                    <div className="relative flex items-center justify-between p-8 bg-white border border-slate-100 rounded-[32px] hover:border-slate-200 hover:shadow-xl transition-all duration-500">
                                        
                                        <div className="flex items-center gap-8">
                                            <div className="w-10 text-center">
                                                <span className="text-slate-200 font-black text-2xl italic group-hover:text-slate-900 transition-colors">#{index + 4}</span>
                                            </div>
                                            
                                            <div className="relative">
                                                <Avatar className="w-16 h-16 border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                                                    <AvatarImage src={entry.user.profile?.avatar} />
                                                    <AvatarFallback className="bg-slate-100 text-slate-400 font-black">{entry.user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-lg">
                                                    {entry.level}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-sky-600 transition-colors">{entry.user.name}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade {entry.user.grade || "N/A"}</span>
                                                    {getMovementBadge(entry.movement)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="hidden lg:flex items-center gap-6">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streak</span>
                                                    <span className="text-slate-900 font-black flex items-center gap-1.5">
                                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                        {entry.currentStreak}
                                                    </span>
                                                </div>
                                                <div className="w-px h-10 bg-slate-100 mx-2" />
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression</span>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-slate-900 rounded-full" 
                                                            style={{ width: `${(entry.xp % 50) * 2}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right min-w-[120px]">
                                                <div className="flex items-center justify-end gap-2 text-sky-600">
                                                    <Zap size={18} className="fill-sky-600" />
                                                    <span className="text-3xl font-black tracking-tighter">{getXP(entry)}</span>
                                                </div>
                                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mt-1">Global XP</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {data.length === 0 && (
                            <div className="text-center py-40 bg-slate-50 rounded-[56px] border border-dashed border-slate-200">
                                <Trophy className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-slate-300 italic uppercase tracking-tighter">No Champions Detected</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">The vault is currently awaiting its first legends.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
