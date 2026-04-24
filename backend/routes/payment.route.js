import express from "express";
import * as controller from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public/Student routes
router.post("/pay", controller.pay);
router.get("/verify/:tx_ref", controller.verify);

// 🔥 ADMIN ROUTES
router.patch("/approve/:id", protectRoute, controller.approvePayment);
router.patch("/reject/:id", protectRoute, controller.rejectPayment);

export default router;
