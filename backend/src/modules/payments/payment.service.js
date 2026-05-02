import axios from "axios";
import Payment from "./payment.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class PaymentService {
    static async initializePayment(student, subject, amount, method) {
        const transactionId = `tx-${student}-${Date.now()}`;

        const payment = await Payment.create({
            student,
            subject,
            amount,
            method,
            transactionId,
            status: "pending"
        });

        return {
            success: true,
            message: "Payment initialized",
            transactionId,
            payment
        };
    }

    static async verifyPayment(transactionId) {
        const payment = await Payment.findOne({ transactionId });
        if (!payment) throw new ApiError(404, "Payment record not found");

        // Simulate successful verification
        payment.status = "completed";
        await payment.save();
        return payment;
    }
}
