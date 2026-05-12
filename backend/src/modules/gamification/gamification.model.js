import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
});

const gamificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    xp: {
        type: Number,
        default: 0
    },
    weeklyXP: {
        type: Number,
        default: 0
    },
    semesterXP: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    badges: [badgeSchema],
    achievements: [{
        id: String,
        name: String,
        description: String,
        icon: String,
        unlockedAt: { type: Date, default: Date.now }
    }],
    dailyMissions: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    lastMissionRefresh: {
        type: Date,
        default: Date.now
    },
    lastResetWeekly: {
        type: Date,
        default: Date.now
    },
    lastResetSemester: {
        type: Date,
        default: Date.now
    },
    previousWeeklyRank: {
        type: Number,
        default: 0
    },
    lastRankUpdate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add indexes for leaderboard performance
gamificationSchema.index({ xp: -1 });
gamificationSchema.index({ weeklyXP: -1 });
gamificationSchema.index({ semesterXP: -1 });

// Pre-save hook to calculate level based on XP
gamificationSchema.pre("save", function(next) {
    // Fast progression curve for testing/motivation: Level = floor(sqrt(XP / 50)) + 1
    // e.g. 0 XP = Lvl 1. 50 XP = Lvl 2. 200 XP = Lvl 3. 450 XP = Lvl 4.
    const calculatedLevel = Math.floor(Math.sqrt(this.xp / 50)) + 1;
    if (calculatedLevel > this.level) {
        this.level = calculatedLevel;
        // We could emit a level-up event here if we used a pub/sub system
    }
    next();
});

export const Gamification = mongoose.model("Gamification", gamificationSchema);
