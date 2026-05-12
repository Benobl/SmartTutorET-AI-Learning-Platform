import { PaymentService } from "./payment.service.js";

export class PaymentController {
    static async initialize(req, res, next) {
        try {
            console.log("🚀 PAYMENT ROUTE HIT")
            console.log("BODY:", JSON.stringify(req.body, null, 2))
            const { amount, subjectId, method } = req.body;
            const studentId = req.user._id;
            const data = await PaymentService.initializePayment(studentId, subjectId, amount, method);
            
            console.log("✅ [Payment Controller] Sending Success Response");
            console.log("   - Checkout URL:", data.checkout_url);
            
            res.json({ 
                success: true, 
                checkout_url: data.checkout_url,
                data 
            });
        } catch (error) {
            next(error);
        }
    }

    static async verify(req, res, next) {
        try {
            const { tx_ref } = req.params;
            const payment = await PaymentService.verifyPayment(tx_ref);
            res.json({ success: true, message: "Payment verified successfully", data: payment });
        } catch (error) {
            next(error);
        }
    }

    static async getPayments(req, res, next) {
        try {
            const { subjectId } = req.params;
            const payments = await PaymentService.getSubjectPayments(subjectId);
            res.json({ success: true, data: payments });
        } catch (error) {
            next(error);
        }
    }

    static async checkEnrollment(req, res, next) {
        try {
            const { subjectId } = req.params;
            const studentId = req.user._id;
            const result = await PaymentService.checkEnrollment(studentId, subjectId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getTutorEarnings(req, res, next) {
        try {
            const earnings = await PaymentService.getTutorEarnings(req.user._id);
            res.json({ success: true, data: earnings });
        } catch (error) {
            next(error);
        }
    }

    static async getAdminEarnings(req, res, next) {
        try {
            const earnings = await PaymentService.getAdminEarnings();
            res.json({ success: true, data: earnings });
        } catch (error) {
            next(error);
        }
    }

    static async getPendingApprovals(req, res, next) {
        try {
            const pending = await PaymentService.getPendingApprovals();
            res.json({ success: true, data: pending });
        } catch (error) {
            next(error);
        }
    }

    static async approve(req, res, next) {
        try {
            const { paymentId } = req.params;
            const adminId = req.user._id;
            const payment = await PaymentService.approvePayment(paymentId, adminId);
            res.json({ success: true, message: "Payment approved and student enrolled", data: payment });
        } catch (error) {
            next(error);
        }
    }
}
