import express from "express";
import { PaymentController } from "./payment.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/initialize", verifyToken, PaymentController.initialize);
router.get("/verify/:tx_ref", verifyToken, PaymentController.verify);
router.get("/subject/:subjectId", verifyToken, PaymentController.getPayments);

export default router;
