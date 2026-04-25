import express from "express";
import { AdminController } from "./admin.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.use(protectRoute);
router.use(authorize("admin", "manager"));

router.get("/pending-tutors", AdminController.getPending);
router.post("/jobs", AdminController.createJob);
router.patch("/approve-tutor/:userId", AdminController.approve);
router.patch("/reject-tutor/:userId", AdminController.reject);

export default router;
