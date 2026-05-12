import cron from "node-cron";
import { resetWeeklyXP, resetSemesterXP } from "../modules/gamification/gamification.controller.js";

export const initCronJobs = () => {
    // Weekly reset: Every Monday at 00:00
    cron.schedule("0 0 * * 1", async () => {
        console.log("[CRON] Running weekly XP reset...");
        await resetWeeklyXP();
    });

    // Semester reset: Every 4 months (e.g., Jan 1, May 1, Sept 1 at 01:00)
    cron.schedule("0 1 1 1,5,9 *", async () => {
        console.log("[CRON] Running semester XP reset...");
        await resetSemesterXP();
    });

    console.log("[CRON] All scheduled jobs initialized.");
};
