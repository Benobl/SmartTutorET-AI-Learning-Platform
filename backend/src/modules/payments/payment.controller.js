import { PaymentService } from "./payment.service.js";

export class PaymentController {
    static async initialize(req, res, next) {
        try {
            const { amount, subjectId, method } = req.body;
            const studentId = req.user._id;
            const data = await PaymentService.initializePayment(studentId, subjectId, amount, method);
            res.json({ success: true, data });
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
}
