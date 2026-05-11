import express from "express";
import { MasterScheduleController } from "./master-schedule.controller.js";
import { verifyToken, allowRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", MasterScheduleController.getAll);
router.get("/my-schedule", allowRoles("tutor"), MasterScheduleController.getMySchedule);
router.get("/grade/:grade", MasterScheduleController.getByGrade);
router.post("/", allowRoles("manager", "admin"), MasterScheduleController.create);
router.delete("/:id", allowRoles("manager", "admin"), MasterScheduleController.delete);

export default router;
