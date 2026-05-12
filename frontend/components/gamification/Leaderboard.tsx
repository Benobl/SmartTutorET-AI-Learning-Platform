"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardPodium } from "./LeaderboardPodium";
import { api } from "@/lib/api";
import { Trophy, Minus } from "lucide-react";

export const Leaderboard = () => {
    const [type, setType] = useState<"weekly" | "semester" | "all-time">("weekly");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/gamification/leaderboard/${type}`);
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type]);

    const getXP = (entry: any) => {
        if (type === "weekly") return entry.weeklyXP || 0;
        if (type === "semester") return entry.semesterXP || 0;
        return entry.xp || 0;
    };

    return (
        <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[40px] overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 border-b border-slate-100">
                <div className="text-center md:text-left">
                    <CardTitle className="text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3 italic tracking-tighter">
                        <Trophy className="text-yellow-500 w-10 h-10" />
                        LEADERBOARD
                    </CardTitle>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Real-time academic rankings</p>
                </div>
                <Tabs value={type} onValueChange={(v: any) => setType(v)} className="w-full md:w-auto">
                    <TabsList className="bg-slate-100/50 border border-slate-200 p-1 rounded-2xl w-full">
                        <TabsTrigger value="weekly" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-xl transition-all px-6 py-2.5 font-bold text-xs uppercase tracking-widest">Weekly</TabsTrigger>
                        <TabsTrigger value="semester" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-xl transition-all px-6 py-2.5 font-bold text-xs uppercase tracking-widest">Semester</TabsTrigger>
                        <TabsTrigger value="all-time" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-xl transition-all px-6 py-2.5 font-bold text-xs uppercase tracking-widest">All-Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="p-8">
                {loading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full bg-slate-50 rounded-[32px]" />
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-16 w-full bg-slate-50 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <>
                        {data.length > 0 && <LeaderboardPodium topThree={data.slice(0, 3)} type={type} />}

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar mt-8">
                            <AnimatePresence mode="popLayout">
                                {data.slice(3).map((entry, index) => (
                                    <motion.div
                                        key={entry._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="group flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
                                    >
                                        <div className="flex items-center gap-5">
                                            <span className="text-slate-300 font-black text-sm w-8 text-center italic">#{index + 4}</span>
                                            <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                                                <AvatarImage src={entry.user.profile?.avatar} />
                                                <AvatarFallback className="bg-slate-100 text-slate-400 font-bold">{entry.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{entry.user.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade {entry.user.grade || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-indigo-600 leading-none tracking-tighter">{getXP(entry)}</p>
                                                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black mt-1">XP Points</p>
                                            </div>
                                            <Minus className="w-4 h-4 text-slate-200 hidden md:block" />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {data.length === 0 && (
                                <div className="text-center py-24 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                                    <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest italic">No Data Collected</p>
                                    <p className="text-slate-300 text-[10px] font-bold mt-2 uppercase">Complete lessons to appear here</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
