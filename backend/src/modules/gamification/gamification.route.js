import express from "express";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { 
    getProfile, 
    awardXP, 
    getWeeklyLeaderboard, 
    getSemesterLeaderboard, 
    getAllTimeLeaderboard 
} from "./gamification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/profile", getProfile);
router.post("/award-xp", awardXP);

// Unified Leaderboard (defaults to weekly)
router.get("/leaderboard", getWeeklyLeaderboard);

// Specific Leaderboards
router.get("/weekly", getWeeklyLeaderboard);
router.get("/semester", getSemesterLeaderboard);
router.get("/all-time", getAllTimeLeaderboard);

// Deprecated/Compatibility aliases
router.get("/leaderboard/weekly", getWeeklyLeaderboard);
router.get("/leaderboard/semester", getSemesterLeaderboard);
router.get("/leaderboard/all-time", getAllTimeLeaderboard);

export default router;
