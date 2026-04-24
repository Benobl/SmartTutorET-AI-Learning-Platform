import * as paymentService from "../lib/payment.service.js";
import Payment from "../models/payment.model.js";

// =======================
// 💳 INITIALIZE PAYMENT
// =======================
export const pay = async (req, res) => {
    try {
        const response = await paymentService.initializePayment(req.body);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// ✅ VERIFY PAYMENT (Chapa)
// =======================
export const verify = async (req, res) => {
    try {
        const data = await paymentService.verifyPayment(req.params.tx_ref);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// 🟢 APPROVE (ADMIN)
// =======================
export const approvePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // optional safety check
        if (payment.paymentStatus !== "completed") {
            return res.status(400).json({
                message: "Cannot approve unpaid transaction"
            });
        }

        payment.approvalStatus = "approved";
        payment.approvedBy = req.user?._id || null; // backend uses _id
        payment.approvedAt = new Date();

        await payment.save();

        res.json({ message: "Payment approved", payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =======================
// 🔴 REJECT (ADMIN)
// =======================
export const rejectPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        payment.approvalStatus = "rejected";
        payment.approvedBy = req.user?._id || null; // backend uses _id
        payment.approvedAt = new Date();

        await payment.save();

        res.json({ message: "Payment rejected", payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
