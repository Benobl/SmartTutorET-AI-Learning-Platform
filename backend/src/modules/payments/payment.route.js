import express from "express";
import { PaymentController } from "./payment.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/initialize", verifyToken, PaymentController.initialize);
// Public because Chapa callback_url cannot send JWT/cookies.
// Verification is still secure since we verify against Chapa using our secret key.
router.get("/verify/:tx_ref", PaymentController.verify);
router.get("/subject/:subjectId", verifyToken, PaymentController.getPayments);
router.get("/check-enrollment/:subjectId", verifyToken, PaymentController.checkEnrollment);
router.get("/tutor/earnings", verifyToken, PaymentController.getTutorEarnings);
router.get("/admin/earnings", verifyToken, PaymentController.getAdminEarnings);

export default router;
