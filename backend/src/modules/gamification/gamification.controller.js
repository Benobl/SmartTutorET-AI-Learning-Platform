import mongoose from "mongoose";
import { Gamification } from "./gamification.model.js";
import User from "../users/user.model.js";

const DEFAULT_MISSIONS = [
    { id: "daily_login", title: "Show Up", type: "login", target: 1, xpReward: 10 },
    { id: "daily_quiz", title: "Brain Teaser", type: "quiz", target: 1, xpReward: 50 },
    { id: "daily_assignment", title: "Homework Hero", type: "assignment", target: 1, xpReward: 100 }
];

const ACHIEVEMENTS = [
    { id: "quiz_master", name: "Quiz Master", description: "Complete 10 quizzes", icon: "🏆", target: 10, type: "quiz" },
    { id: "assignment_hero", name: "Assignment Hero", description: "Submit 5 assignments", icon: "🛡️", target: 5, type: "assignment" },
    { id: "study_king", name: "Study King", description: "Maintain a 7-day streak", icon: "👑", target: 7, type: "streak" },
    { id: "perfect_attendance", name: "Perfect Attendance", description: "Attend 5 live classes", icon: "⭐", target: 5, type: "attendance" }
];

export const getProfile = async (req, res, next) => {
    try {
        // Use native MongoDB collection to bypass Mongoose casting entirely
        const rawProfile = await mongoose.connection.db.collection('gamifications').findOne({ 
            user: new mongoose.Types.ObjectId(req.user._id) 
        });
        
        let profile;

        if (!rawProfile) {
            profile = new Gamification({ 
                user: req.user._id,
                xp: 0,
                weeklyXP: 0,
                semesterXP: 0,
                dailyMissions: DEFAULT_MISSIONS 
            });
            await profile.save();
        } else {
            // Repair the raw object before hydrating it to avoid CastError
            if (!Array.isArray(rawProfile.dailyMissions) || rawProfile.dailyMissions.some(m => typeof m === 'string' || !m?.id)) {
                console.warn(`[Gamification] Repairing raw malformed dailyMissions for user ${req.user._id}`);
                rawProfile.dailyMissions = DEFAULT_MISSIONS;
            }
            // Re-hydrate the profile
            profile = new Gamification(rawProfile);
            profile.isNew = false; // It's an existing document
        }

        // Robustness: Ensure dailyMissions is an array of valid objects
        let needsReset = !Array.isArray(profile.dailyMissions) || profile.dailyMissions.length === 0;
        
        if (!needsReset) {
            // Check if any element is a string (especially a stringified JS/JSON array)
            const hasCorruptedData = profile.dailyMissions.some(m => 
                typeof m === 'string' || 
                m === null || 
                (typeof m === 'object' && !m.id)
            );
            if (hasCorruptedData) needsReset = true;
        }

        if (needsReset) {
            console.warn(`[Gamification] Purging malformed dailyMissions for user ${req.user._id}`);
            profile.dailyMissions = DEFAULT_MISSIONS;
            // Force Mongoose to recognize the change for mixed/array types
            profile.markModified('dailyMissions');
            await profile.save();
        }

        const today = new Date().setHours(0, 0, 0, 0);
        const lastRefresh = new Date(profile.lastMissionRefresh).setHours(0, 0, 0, 0);
        
        if (today > lastRefresh) {
            // Streak logic
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const lastActiveDate = new Date(profile.lastActive || 0).setHours(0, 0, 0, 0);
            
            if (lastActiveDate === yesterday.getTime()) {
                profile.currentStreak += 1;
                profile.longestStreak = Math.max(profile.currentStreak, profile.longestStreak);
            } else if (lastActiveDate < yesterday.getTime()) {
                profile.currentStreak = 1;
            }

            // Award Daily Login XP (+10)
            profile.xp += 10;
            profile.weeklyXP += 10;
            profile.semesterXP += 10;

            profile.dailyMissions = DEFAULT_MISSIONS;
            profile.lastMissionRefresh = new Date();
            profile.lastActive = new Date();
            await profile.save();
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error("[Gamification Profile Error]:", error);
        next(error);
    }
};

export const awardXP = async (req, res, next) => {
    try {
        const { amount, reason, metadata } = req.body;
        const userId = req.user._id;

        if (!amount && !reason) return res.status(400).json({ success: false, message: "XP amount or reason required" });

        // Use native MongoDB collection to bypass Mongoose casting
        const rawProfile = await mongoose.connection.db.collection('gamifications').findOne({ 
            user: new mongoose.Types.ObjectId(userId) 
        });
        
        let profile;

        if (!rawProfile) {
            profile = new Gamification({ user: userId, dailyMissions: DEFAULT_MISSIONS });
            await profile.save();
        } else {
            // Repair if corrupted
            if (!Array.isArray(rawProfile.dailyMissions) || rawProfile.dailyMissions.some(m => typeof m === 'string' || !m?.id)) {
                console.warn(`[Gamification] Repairing raw malformed dailyMissions in awardXP for user ${userId}`);
                rawProfile.dailyMissions = DEFAULT_MISSIONS;
            }
            profile = new Gamification(rawProfile);
            profile.isNew = false;
        }

        // GPA Weighting: +10% boost for high performers (e.g. GPA > 3.5)
        // This assumes req.user.gpa exists.
        const gpaBoost = (req.user.gpa && req.user.gpa > 3.5) ? 1.1 : 1.0;
        
        let xpToAdd = Number(amount || 0);

        // Map reasons to standard XP if amount not provided
        if (reason && !amount) {
            const xpMap = {
                'quiz': 50,
                'perfect_quiz': 75, // 50 + 25 bonus
                'assignment': 100,
                'login': 10,
                'attendance': 30,
                'ai_study': 20,
            };
            xpToAdd = xpMap[reason] || 0;
        }

        xpToAdd = Math.floor(xpToAdd * gpaBoost);
        
        const oldLevel = profile.level;
        profile.xp += xpToAdd;
        profile.weeklyXP += xpToAdd;
        profile.semesterXP += xpToAdd;

        // 7-Day Streak Bonus
        if (profile.currentStreak === 7 && reason === 'login') {
            const streakBonus = 100;
            profile.xp += streakBonus;
            profile.weeklyXP += streakBonus;
            profile.semesterXP += streakBonus;
        }

        // Update mission progress
        if (reason) {
            const missionType = reason === 'perfect_quiz' ? 'quiz' : reason;
            const mission = profile.dailyMissions.find(m => m.type === missionType && !m.isCompleted);
            if (mission) {
                mission.progress += 1;
                if (mission.progress >= mission.target) {
                    mission.isCompleted = true;
                    const bonus = mission.xpReward;
                    profile.xp += bonus;
                    profile.weeklyXP += bonus;
                    profile.semesterXP += bonus;
                }
            }

            await checkAchievements(profile, reason);
        }

        profile.lastActive = new Date();
        await profile.save();

        if (res) {
            res.json({ 
                success: true, 
                data: {
                    xp: profile.xp,
                    weeklyXP: profile.weeklyXP,
                    level: profile.level,
                    leveledUp: profile.level > oldLevel,
                    earned: xpToAdd
                }
            });
        }
        return profile;
    } catch (error) {
        if (next) next(error);
        else throw error;
    }
};

async function checkAchievements(profile, type) {
    const relevantAchievements = ACHIEVEMENTS.filter(a => a.type === type);
    
    for (const ach of relevantAchievements) {
        const alreadyEarned = profile.achievements.find(a => a.id === ach.id);
        if (alreadyEarned) continue;

        // Logic to count totals (simplified for now)
        // In a real app, you'd query the database for total completed items
        // For now, we can use streaks or missions progress as proxies or just increment a counter
        // Let's assume we have simple counters for achievements
        
        // This is a placeholder for more complex achievement logic
        // For demonstration, let's unlock if they just completed a mission of that type
        const mission = profile.dailyMissions.find(m => m.type === type && m.isCompleted);
        if (mission) {
            profile.achievements.push({
                id: ach.id,
                name: ach.name,
                description: ach.description,
                icon: ach.icon
            });
        }
    }
}

export const getWeeklyLeaderboard = async (req, res, next) => {
    try {
        const topUsers = await Gamification.find()
            .sort({ weeklyXP: -1 })
            .limit(50)
            .populate("user", "name profile grade");
            
        const leaderboard = topUsers.map((entry, index) => {
            const currentRank = index + 1;
            const previousRank = entry.previousWeeklyRank || currentRank;
            let movement = 'steady';
            if (previousRank > currentRank) movement = 'up';
            else if (previousRank < currentRank) movement = 'down';
            
            return {
                ...entry.toObject(),
                currentRank,
                movement
            };
        });

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        next(error);
    }
};

export const getSemesterLeaderboard = async (req, res, next) => {
    try {
        const topUsers = await Gamification.find()
            .sort({ semesterXP: -1 })
            .limit(20)
            .populate("user", "name profile grade");
            
        res.json({ success: true, data: topUsers });
    } catch (error) {
        next(error);
    }
};

export const getAllTimeLeaderboard = async (req, res, next) => {
    try {
        const topUsers = await Gamification.find()
            .sort({ xp: -1 })
            .limit(20)
            .populate("user", "name profile grade");
            
        res.json({ success: true, data: topUsers });
    } catch (error) {
        next(error);
    }
};

export const resetWeeklyXP = async () => {
    await Gamification.updateMany({}, { $set: { weeklyXP: 0, lastResetWeekly: new Date() } });
    console.log("[Gamification] Weekly leaderboard reset completed.");
};

export const resetSemesterXP = async () => {
    await Gamification.updateMany({}, { $set: { semesterXP: 0, lastResetSemester: new Date() } });
    console.log("[Gamification] Semester leaderboard reset completed.");
};
