import express from "express";
import { SubjectController } from "./subject.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/rbac.middleware.js";

import { uploadSyllabus } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("tutor", "admin", "manager"), uploadSyllabus.single("syllabus"), SubjectController.createSubject);
router.patch("/:subjectId", verifyToken, allowRoles("tutor", "admin", "manager"), uploadSyllabus.single("syllabus"), SubjectController.update);
router.delete("/:subjectId", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.delete);
router.get("/", verifyToken, SubjectController.getAll);
router.get("/recommendations", verifyToken, SubjectController.getRecommendations);
router.get("/my-courses", verifyToken, SubjectController.getMyCourses);
router.get("/my-students", verifyToken, allowRoles("tutor", "manager", "admin"), SubjectController.getMyStudents);
router.patch("/:subjectId/approve", verifyToken, allowRoles("manager", "admin"), SubjectController.approve);
router.patch("/:subjectId/reject", verifyToken, allowRoles("manager", "admin"), SubjectController.reject);
router.get("/:subjectId", verifyToken, SubjectController.getSubject);
router.post("/:subjectId/enroll", verifyToken, SubjectController.enroll);

export default router;
