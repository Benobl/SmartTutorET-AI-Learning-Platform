"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AchievementProps {
    achievement: {
        id: string;
        name: string;
        description: string;
        icon: string;
        unlockedAt?: string;
    };
    isUnlocked: boolean;
}

export const AchievementCard = ({ achievement, isUnlocked }: AchievementProps) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative p-5 rounded-[32px] border transition-all duration-500 ${
                isUnlocked 
                ? "bg-white border-indigo-200 shadow-xl shadow-indigo-500/5" 
                : "bg-slate-50 border-slate-100 opacity-60 grayscale"
            }`}
        >
            {!isUnlocked && (
                <div className="absolute top-4 right-4">
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                </div>
            )}
            <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4 transition-colors ${
                    isUnlocked ? "bg-indigo-50" : "bg-white border border-slate-100"
                }`}>
                    {achievement.icon}
                </div>
                <h4 className={`font-black text-sm uppercase tracking-tight ${isUnlocked ? "text-indigo-600" : "text-slate-400"}`}>
                    {achievement.name}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 leading-tight uppercase tracking-tight">
                    {achievement.description}
                </p>
                {isUnlocked && achievement.unlockedAt && (
                    <span className="text-[8px] text-indigo-400 font-black mt-3 uppercase tracking-widest border-t border-indigo-50 pt-2 w-full">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        </motion.div>
    );
};
