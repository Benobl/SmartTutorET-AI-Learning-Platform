import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    tx_ref: String,

    amount: Number,
    currency: { type: String, default: "ETB" },

    email: String,

    // 🔹 Link payment to a specific course
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    // 🔹 Payment system status (Chapa)
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },

    // 🔹 Admin decision
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    // 🔹 Who approved/rejected
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    approvedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
