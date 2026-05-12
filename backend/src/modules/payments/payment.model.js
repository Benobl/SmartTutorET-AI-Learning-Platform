import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "awaiting_approval", "approved", "completed", "failed"],
        default: "pending"
    },
    verified: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    method: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tutorAmount: {
        type: Number,
        default: 0
    },
    adminAmount: {
        type: Number,
        default: 0
    },
    verifiedAt: Date,
    approvedAt: Date,
    failedAt: Date,
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
