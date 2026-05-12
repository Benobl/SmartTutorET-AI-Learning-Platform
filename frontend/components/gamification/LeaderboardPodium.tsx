"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Trophy } from "lucide-react";

interface LeaderboardEntry {
    user: {
        name: string;
        profile?: {
            avatar?: string;
        };
    };
    xp?: number;
    weeklyXP?: number;
    semesterXP?: number;
}

interface PodiumProps {
    topThree: LeaderboardEntry[];
    type: "weekly" | "semester" | "all-time";
}

export const LeaderboardPodium = ({ topThree, type }: PodiumProps) => {
    const getXP = (entry: LeaderboardEntry) => {
        if (type === "weekly") return entry.weeklyXP || 0;
        if (type === "semester") return entry.semesterXP || 0;
        return entry.xp || 0;
    };

    const displayOrder = [topThree[1], topThree[0], topThree[2]];

    return (
        <div className="flex items-end justify-center gap-2 md:gap-8 mb-12 h-64">
            {displayOrder.map((entry, index) => {
                if (!entry) return <div key={index} className="flex-1" />;
                
                const isFirst = index === 1;
                const isSecond = index === 0;
                const isThird = index === 2;

                return (
                    <motion.div
                        key={entry.user.name + index}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        className={`flex flex-col items-center flex-1 max-w-[120px] md:max-w-[150px]`}
                    >
                        <div className="relative mb-4">
                            <Avatar className={`
                                ${isFirst ? "w-20 h-20 md:w-28 md:h-28 border-4 border-yellow-400 shadow-xl" : 
                                  isSecond ? "w-16 h-16 md:w-20 md:h-20 border-4 border-slate-200 shadow-lg" : 
                                  "w-16 h-16 md:w-20 md:h-20 border-4 border-amber-600/30 shadow-lg"}
                            `}>
                                <AvatarImage src={entry.user.profile?.avatar} />
                                <AvatarFallback className="text-xl md:text-3xl bg-slate-100 text-slate-400">
                                    {entry.user.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                {isFirst && <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 fill-yellow-500" />}
                                {isSecond && <Medal className="w-6 h-6 md:w-8 md:h-8 text-slate-300 fill-slate-300" />}
                                {isThird && <Medal className="w-6 h-6 md:w-8 md:h-8 text-amber-700 fill-amber-700 opacity-50" />}
                            </div>
                        </div>

                        <div className={`
                            w-full rounded-t-3xl flex flex-col items-center justify-end p-2 md:p-4 text-slate-900 border-x border-t
                            ${isFirst ? "h-32 bg-gradient-to-b from-yellow-50 to-white border-yellow-200" : 
                              isSecond ? "h-24 bg-gradient-to-b from-slate-50 to-white border-slate-200" : 
                              "h-20 bg-gradient-to-b from-amber-50 to-white border-amber-100"}
                        `}>
                            <p className="font-black text-[10px] md:text-xs truncate w-full text-center mb-1 uppercase tracking-tighter">
                                {entry.user.name}
                            </p>
                            <p className={`font-black text-sm md:text-xl ${isFirst ? "text-yellow-600" : isSecond ? "text-slate-500" : "text-amber-700"}`}>
                                {getXP(entry)}
                            </p>
                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP Points</span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
