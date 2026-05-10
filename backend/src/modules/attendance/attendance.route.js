import express from "express";
import { AttendanceController } from "./attendance.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/log", verifyToken, AttendanceController.logAttendance);
router.get("/my", verifyToken, AttendanceController.getMyAttendance);
router.get("/subject/:subjectId", verifyToken, AttendanceController.getTutorAttendance);

export default router;
