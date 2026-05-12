"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Crown, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react"

interface PodiumEntry {
    _id: string;
    user: {
        name: string;
        profile?: {
            avatar?: string;
        };
    };
    xp: number;
    weeklyXP: number;
    semesterXP: number;
    level: number;
    movement: 'up' | 'down' | 'steady';
}

interface PremiumPodiumProps {
    topThree: PodiumEntry[];
    type: 'weekly' | 'semester' | 'all-time';
}

export function PremiumPodium({ topThree, type }: PremiumPodiumProps) {
    // Reorder: 2nd, 1st, 3rd for visual podium
    const displayOrder = [topThree[1], topThree[0], topThree[2]];

    const podiumVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.8, ease: "easeOut" }
        })
    };

    const getXP = (entry: PodiumEntry) => {
        if (type === 'weekly') return entry.weeklyXP;
        if (type === 'semester') return entry.semesterXP;
        return entry.xp;
    };

    const getMovementIcon = (m: string) => {
        if (m === 'up') return <TrendingUp className="text-emerald-500 w-3 h-3" />;
        if (m === 'down') return <TrendingDown className="text-rose-500 w-3 h-3" />;
        return <Minus className="text-slate-300 w-3 h-3" />;
    };

    return (
        <div className="flex flex-row items-end justify-center gap-4 md:gap-12 min-h-[420px] mt-12 mb-16 relative">
            {/* Background Accent */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-slate-50/50 rounded-[48px] -z-10 border border-slate-100" />

            {displayOrder.map((entry, index) => {
                if (!entry) return <div key={index} className="flex-1" />;

                const isFirst = entry._id === topThree[0]?._id;
                const isSecond = entry._id === topThree[1]?._id;
                const isThird = entry._id === topThree[2]?._id;

                const height = isFirst ? "h-64" : isSecond ? "h-48" : "h-36";
                const color = isFirst ? "bg-slate-900 shadow-slate-900/10" : isSecond ? "bg-white border border-slate-100 shadow-sm" : "bg-white border border-slate-100 shadow-sm";
                const textColor = isFirst ? "text-white" : "text-slate-900";
                const rankColor = isFirst ? "text-yellow-400" : isSecond ? "text-slate-400" : "text-amber-600";

                return (
                    <motion.div
                        key={entry._id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={podiumVariants}
                        className="flex flex-col items-center flex-1 max-w-[160px] group"
                    >
                        {/* Avatar Section */}
                        <div className="relative mb-6">
                            <motion.div
                                animate={isFirst ? { y: [0, -10, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            >
                                <Avatar className={`w-16 h-16 md:w-24 md:h-24 border-4 ${isFirst ? "border-yellow-400 shadow-yellow-400/20" : "border-white"} shadow-2xl relative z-10`}>
                                    <AvatarImage src={entry.user.profile?.avatar} />
                                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{entry.user.name[0]}</AvatarFallback>
                                </Avatar>
                            </motion.div>
                            
                            {isFirst && (
                                <motion.div 
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 5 }}
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 z-20"
                                >
                                    <Crown className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]" />
                                </motion.div>
                            )}
                            
                            <div className="absolute -bottom-2 right-0 z-20 bg-white border border-slate-100 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg">
                                {getMovementIcon(entry.movement)}
                            </div>
                        </div>

                        {/* Name and Level */}
                        <div className="text-center mb-6">
                            <h4 className="font-bold text-slate-900 text-sm md:text-base truncate w-full group-hover:text-sky-600 transition-colors">
                                {entry.user.name}
                            </h4>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level {entry.level}</span>
                            </div>
                        </div>

                        {/* Podium Block */}
                        <div className={`w-full ${height} rounded-[32px] ${color} shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-105`}>
                            <span className={`text-5xl md:text-7xl font-black ${isFirst ? 'text-white/10' : 'text-slate-50'} italic select-none`}>
                                {isFirst ? "1" : isSecond ? "2" : "3"}
                            </span>
                            <div className="absolute bottom-6 flex flex-col items-center">
                                <span className={`font-black text-lg md:text-2xl tracking-tighter ${textColor}`}>{getXP(entry)}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isFirst ? 'text-white/40' : 'text-slate-400'}`}>XP</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
