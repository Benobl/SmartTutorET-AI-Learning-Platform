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
        enum: ["pending", "completed", "failed"],
        default: "pending"
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
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
