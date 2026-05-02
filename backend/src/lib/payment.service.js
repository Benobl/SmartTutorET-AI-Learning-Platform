import axios from "axios";
import Payment from "../models/payment.model.js";
import { generateTxRef } from "./paymentUtils.js";

// =======================
// 💳 INITIALIZE PAYMENT
// =======================
export const initializePayment = async (data) => {
    const tx_ref = generateTxRef();

    const payload = {
        amount: data.amount,
        currency: "ETB",
        email: data.email,
        first_name: "Student",
        last_name: "User",
        tx_ref,
        callback_url: `${process.env.BASE_URL}/api/payment/verify/${tx_ref}`,
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
    };

    const response = await axios.post(
        "https://api.chapa.co/v1/transaction/initialize",
        payload,
        {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            },
        }
    );

    await Payment.create({
        tx_ref,
        amount: data.amount,
        email: data.email,
        subjectId: data.subjectId
    });

    return response.data;
};

// =======================
// ✅ VERIFY PAYMENT
// =======================
export const verifyPayment = async (tx_ref) => {
    const response = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            },
        }
    );

    if (response.data.status === "success") {
        await Payment.findOneAndUpdate(
            { tx_ref },
            { paymentStatus: "completed" }
        );
    }

    return response.data;
};
