import express from "express";
import { SubjectController } from "./subject.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.createSubject);
router.patch("/:subjectId", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.update);
router.delete("/:subjectId", verifyToken, allowRoles("tutor", "admin", "manager"), SubjectController.delete);
router.get("/", verifyToken, SubjectController.getAll);
router.get("/:subjectId", verifyToken, SubjectController.getSubject);
router.post("/:subjectId/enroll", verifyToken, SubjectController.enroll);

export default router;
