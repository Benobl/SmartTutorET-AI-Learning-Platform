import axios from "axios";
import Payment from "./payment.model.js";
import User from "../users/user.model.js";
import Subject from "../courses/subject.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

export class PaymentService {
    static async initializePayment(studentId, subjectId, amount, method) {
        try {
            const student = await User.findById(studentId);
            const subject = await Subject.findById(subjectId);
            if (!subject) throw new ApiError(404, "Subject not found");

            const tx_ref = `tx-${studentId}-${Date.now()}`;
            const studentName = student.name || student.email.split('@')[0] || "Student";
            const [firstName, ...lastNameParts] = studentName.split(' ');
            const lastName = lastNameParts.join(' ') || "User";

            const finalAmount = amount || subject.price || 0;
            if (finalAmount <= 0) throw new ApiError(400, "Invalid payment amount");

            const chapaData = {
                amount: finalAmount.toString(),
                currency: "ETB",
                email: student.email,
                first_name: firstName,
                last_name: lastName,
                phone_number: student.phone || "0911000000",
                tx_ref,
                callback_url: `${process.env.BASE_URL}/api/payments/verify/${tx_ref}`,
                return_url: `${process.env.FRONTEND_URL}/dashboard/student/courses?tx_ref=${tx_ref}`,
                customization: {
                    title: "Course Payment",
                    description: `Payment for ${subject.title}`
                }
            };

            const response = await axios.post("https://api.chapa.co/v1/transaction/initialize", chapaData, {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
                }
            });

            if (response.data.status !== "success") {
                throw new ApiError(400, "Chapa initialization failed: " + (response.data.message || "Unknown error"));
            }

            await Payment.create({
                student: studentId,
                subject: subjectId,
                amount: finalAmount,
                method: "chapa",
                transactionId: tx_ref,
                status: "pending"
            });

            return {
                checkout_url: response.data.data.checkout_url,
                tx_ref
            };
        } catch (error) {
            console.error("[Chapa Init Error]", error.response?.data || error.message);
            throw new ApiError(500, error.response?.data?.message || "Payment gateway communication failed");
        }
    }

    static async verifyPayment(transactionId) {
        try {
            const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${transactionId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
                }
            });

            const payment = await Payment.findOne({ transactionId });
            if (!payment) throw new ApiError(404, "Payment record not found");

            if (response.data.status === "success") {
                payment.status = "completed";
                await payment.save();
                
                // Also enroll the student in the subject
                const subject = await Subject.findById(payment.subject);
                if (subject && !subject.students.includes(payment.student)) {
                    subject.students.push(payment.student);
                    await subject.save();
                }
            }

            return payment;
        } catch (error) {
            console.error("[Chapa Verify Error]", error.response?.data || error.message);
            throw new ApiError(500, "Payment verification failed");
        }
    }
    static async getSubjectPayments(subjectId) {
        return await Payment.find({ subject: subjectId, status: "completed" })
            .populate("student", "name email profile.avatar")
            .sort({ createdAt: -1 });
    }
}
