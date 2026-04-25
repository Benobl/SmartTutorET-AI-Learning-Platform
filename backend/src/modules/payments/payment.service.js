import axios from "axios";
import Payment from "./payment.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class PaymentService {
    static async initializePayment(userId, amount, email, fullName) {
        const tx_ref = `tx-${userId}-${Date.now()}`;

        // In a real app, you would call Chapa API here
        // const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', ...)

        const payment = await Payment.create({
            userId,
            amount,
            tx_ref,
            status: "pending"
        });

        return {
            checkout_url: `https://test.chapa.co/checkout-now/${tx_ref}`, // Placeholder
            tx_ref,
            payment
        };
    }

    static async verifyPayment(tx_ref) {
        const payment = await Payment.findOne({ tx_ref });
        if (!payment) throw new ApiError(404, "Payment record not found");

        // In a real app, you would verify with Chapa API
        payment.status = "completed";
        await payment.save();
        return payment;
    }
}
