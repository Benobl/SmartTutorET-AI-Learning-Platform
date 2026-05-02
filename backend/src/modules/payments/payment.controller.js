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
            const { transactionId } = req.params;
            const payment = await PaymentService.verifyPayment(transactionId);
            res.json({ success: true, message: "Payment verified", data: payment });
        } catch (error) {
            next(error);
        }
    }
}
