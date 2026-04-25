import express from "express";
import { CourseController } from "./course.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.post("/", protectRoute, authorize("tutor", "admin", "manager"), CourseController.createCourse);
router.get("/:courseId", protectRoute, CourseController.getCourse);
router.post("/:courseId/enroll", protectRoute, CourseController.enroll);

export default router;
