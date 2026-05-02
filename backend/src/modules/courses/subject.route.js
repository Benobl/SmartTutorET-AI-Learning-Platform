import express from "express";
import { SubjectController } from "./subject.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.post("/", protectRoute, authorize("tutor", "admin", "manager"), SubjectController.createSubject);
router.get("/", protectRoute, SubjectController.getAll);
router.get("/:subjectId", protectRoute, SubjectController.getSubject);
router.post("/:subjectId/enroll", protectRoute, SubjectController.enroll);

export default router;
