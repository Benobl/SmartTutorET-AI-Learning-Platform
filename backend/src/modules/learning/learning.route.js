import express from "express";
import { protectRoute as protect, authorizeRoles as authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { uploadVideo } from "../../middleware/upload.middleware.js";
import {
  createCourse,
  createModule,
  createQuiz,
  addModuleContent,
  enrollInCourse,
  gradeStudent,
  gradeAttempt,
  getTutorCourses,
  getCourseSubmissionsForTutor,
  getCourseRankingForTutor,
  getCourses,
  getCourseById,
  submitQuiz,
  getResults,
  getProgress
} from "./learning.controller.js";
import {
  createCourseSchema,
  createModuleSchema,
  createQuizSchema,
  enrollCourseSchema,
  submitQuizSchema,
  gradeStudentSchema,
  gradeAttemptSchema,
  addModuleContentSchema,
  courseIdParamsSchema,
} from "./learning.validation.js";

const router = express.Router();

// Tutor Routes
router.post("/courses", protect, authorize("tutor", "admin", "manager"), validate(createCourseSchema), createCourse);
router.post("/courses/:id/modules", protect, authorize("tutor", "admin", "manager"), validate(createModuleSchema), createModule);
router.post("/courses/:id/modules/:moduleId/content", protect, authorize("tutor", "admin", "manager"), uploadVideo.single("file"), validate(addModuleContentSchema), addModuleContent);
router.post("/quiz/create", protect, authorize("tutor", "admin", "manager"), validate(createQuizSchema), createQuiz);
router.post("/grade/student/:id", protect, authorize("tutor", "admin", "manager"), validate(gradeStudentSchema), gradeStudent);
router.patch("/tutor/attempts/:attemptId/grade", protect, authorize("tutor", "admin", "manager"), validate(gradeAttemptSchema), gradeAttempt);
router.get("/tutor/courses", protect, authorize("tutor", "admin", "manager"), getTutorCourses);
router.get("/tutor/courses/:id/submissions", protect, authorize("tutor", "admin", "manager"), validate(courseIdParamsSchema), getCourseSubmissionsForTutor);
router.get("/tutor/courses/:id/ranking", protect, authorize("tutor", "admin", "manager"), validate(courseIdParamsSchema), getCourseRankingForTutor);

// Student Routes
router.post("/courses/:id/enroll", protect, authorize("student"), validate(enrollCourseSchema), enrollInCourse);
router.get("/courses", protect, authorize("student"), getCourses);
router.get("/courses/:id", protect, authorize("student", "tutor", "admin", "manager"), getCourseById);
router.post("/quiz/:id/submit", protect, authorize("student"), validate(submitQuizSchema), submitQuiz);
router.get("/results", protect, authorize("student"), getResults);
router.get("/progress", protect, authorize("student"), getProgress);

export default router;
