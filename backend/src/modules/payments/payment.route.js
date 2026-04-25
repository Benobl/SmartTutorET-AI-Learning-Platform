import express from "express";
import { PaymentController } from "./payment.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/initialize", protectRoute, PaymentController.initialize);
router.get("/verify/:tx_ref", protectRoute, PaymentController.verify);

export default router;
