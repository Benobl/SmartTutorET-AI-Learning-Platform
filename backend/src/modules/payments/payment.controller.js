import { PaymentService } from "./payment.service.js";

export class PaymentController {
    static async initialize(req, res, next) {
        try {
            const { amount } = req.body;
            const { email, fullName, _id: userId } = req.user;
            const data = await PaymentService.initializePayment(userId, amount, email, fullName);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    static async verify(req, res, next) {
        try {
            const { tx_ref } = req.params;
            const payment = await PaymentService.verifyPayment(tx_ref);
            res.json({ success: true, message: "Payment verified", data: payment });
        } catch (error) {
            next(error);
        }
    }
}
