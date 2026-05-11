import express from "express";
import { SubjectController } from "./subject.controller.js";
import { verifyToken, allowRoles } from "../../middleware/auth.middleware.js";
import { uploadSyllabus, uploadVideo } from "../../middleware/upload.middleware.js";

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
router.post("/manual-enroll", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.enrollStudent);
router.post("/:subjectId/lessons", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.addLesson);
router.post("/:subjectId/lessons/upload-video", verifyToken, allowRoles("tutor", "admin", "manager"), uploadVideo.single("video"), SubjectController.uploadLessonVideo);
router.post("/:subjectId/lessons/auto-generate", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.autoGenerateLessons);
router.get("/:subjectId/lessons", verifyToken, SubjectController.getLessons);

// Unified Content Management
router.post("/:subjectId/content", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.addContent);
router.get("/:subjectId/content", verifyToken, SubjectController.getContent);
router.delete("/content/:contentId", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.deleteContent);

export default router;
