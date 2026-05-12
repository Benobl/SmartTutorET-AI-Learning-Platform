import axios from "axios";
import Payment from "./payment.model.js";
import User from "../users/user.model.js";
import Subject from "../courses/subject.model.js";
import { ApiError } from "../../middleware/error.middleware.js";

// ── Validate CHAPA_SECRET_KEY format at module load time ──
const validateChapaKey = () => {
    const key = process.env.CHAPA_SECRET_KEY;
    if (!key) {
        console.error("❌ [Chapa Config] CHAPA_SECRET_KEY is UNDEFINED. Set it in backend/.env");
        return false;
    }
    if (key.startsWith('"') || key.startsWith("'")) {
        console.error("❌ [Chapa Config] CHAPA_SECRET_KEY has surrounding quotes! Remove them from .env");
        return false;
    }
    if (!key.startsWith("CHASECK_TEST-") && !key.startsWith("CHASECK_LIVE-")) {
        console.error(`❌ [Chapa Config] CHAPA_SECRET_KEY format is wrong. Got: "${key.substring(0, 10)}..."`);
        console.error("   Expected format: CHASECK_TEST-xxxxxxxx or CHASECK_LIVE-xxxxxxxx");
        return false;
    }
    console.log(`✅ [Chapa Config] Key format valid: ${key.substring(0, 13)}... (${key.startsWith("CHASECK_TEST-") ? "SANDBOX" : "LIVE"})`);
    return true;
};

// Run validation on startup
const chapaKeyValid = validateChapaKey();

export class PaymentService {
    static async initializePayment(studentId, subjectId, amount, method = "chapa") {
        // ── STEP 1: Guard – key must be valid before any DB work ──
        const key = process.env.CHAPA_SECRET_KEY;
        console.log("\n[Payment Service] INITIALIZING PAYMENT");
        console.log("  - Student ID:", studentId);
        console.log("  - Subject ID:", subjectId);
        console.log("  - Amount    :", amount);
        console.log("  - Method    :", method);
        console.log("============================================\n");

        if (!key || key.startsWith('"') || key.startsWith("'") || (!key.startsWith("CHASECK_TEST-") && !key.startsWith("CHASECK_LIVE-"))) {
            throw new ApiError(400, "Payment gateway is not configured correctly. Contact support.");
        }

        console.log(`🚀 [Payment] Initializing enrollment for Student: ${studentId}, Subject: ${subjectId}`);
        try {
            const student = await User.findById(studentId);
            const subject = await Subject.findById(subjectId);
            
            if (!student) {
                console.error(`❌ [Payment] Student not found: ${studentId}`);
                throw new ApiError(404, "Student not found");
            }
            if (!subject) {
                console.error(`❌ [Payment] Subject not found: ${subjectId}`);
                throw new ApiError(404, "Subject not found");
            }

            console.log(`📋 [Payment] Subject: ${subject.title}, Price: ${subject.price}, Requested Amount: ${amount}`);

            // ── Guard: Block re-payment for already enrolled students ──
            const alreadyEnrolled = subject.students.some(
                (s) => s.toString() === studentId.toString()
            );
            if (alreadyEnrolled) {
                console.warn(`⚠️ [Payment] Student ${studentId} already enrolled in ${subjectId}`);
                throw new ApiError(400, "You are already enrolled in this course. No payment needed.");
            }

            // ── Guard: Block duplicate completed or awaiting approval payments ──
            const existingPayment = await Payment.findOne({
                student: studentId,
                subject: subjectId,
                status: { $in: ["completed", "awaiting_approval"] }
            });
            
            if (existingPayment) {
                console.warn(`⚠️ [Payment] Existing payment found for student ${studentId}: ${existingPayment.status}`);
                if (existingPayment.status === "completed") {
                    throw new ApiError(400, "You have already paid for this course.");
                } else if (existingPayment.status === "awaiting_approval") {
                    throw new ApiError(400, "Your payment is awaiting admin approval.");
                }
            }

            // Note: If there's a 'pending' payment, we allow creating a new one with a fresh tx_ref.
            // This handles the case where a user closes the Chapa window and tries again.

            const tx_ref = `tx-${studentId}-${Date.now()}`;
            console.log(`🔗 [Payment] Generated tx_ref: ${tx_ref}`);

            const studentName = student.name || student.email.split('@')[0] || "Student";
            const [firstName, ...lastNameParts] = studentName.split(' ');
            const lastName = lastNameParts.join(' ') || "User";

            const finalAmount = amount || subject.price || 0;
            if (finalAmount <= 0) {
                console.error(`❌ [Payment] Invalid amount: ${finalAmount}`);
                throw new ApiError(400, "Invalid payment amount");
            }

            const chapaData = {
                amount: finalAmount.toString(),
                currency: "ETB",
                email: student.email || `${student._id}@smarttutoret.com`,
                first_name: firstName || "Student",
                last_name: lastName || "User",
                phone_number: student.phone || "0911000000",
                tx_ref,
                // Direct return to courses page which handles verification via tx_ref in URL
                return_url: `${process.env.FRONTEND_URL}/dashboard/student/courses?tx_ref=${tx_ref}`,
                // Server-to-server callback for extra reliability
                callback_url: `${process.env.BASE_URL}/api/payments/verify/${tx_ref}`,
                customization: {
                    title: "Course Payment",
                    description: `Payment for ${subject.title}`
                }
            };

            console.log("📡 Sending request to Chapa with key:", `Bearer ${key.substring(0, 13)}...`);
            console.log("PAYLOAD:", JSON.stringify(chapaData, null, 2));

            let checkout_url = "";
            let status = "pending";

            try {
                const response = await axios.post(
                    "https://api.chapa.co/v1/transaction/initialize",
                    chapaData,
                    {
                        headers: {
                            // Use the already-validated local `key` variable — NOT process.env again
                            Authorization: `Bearer ${key}`,
                            "Content-Type": "application/json"
                        },
                        timeout: 15000
                    }
                );

                console.log("📥 CHAPA RESPONSE status :", response.data.status);
                console.log("📥 CHAPA RESPONSE body   :", JSON.stringify(response.data, null, 2));

                if (response.data.status === "success") {
                    checkout_url = response.data.data?.checkout_url;
                    if (!checkout_url) {
                        console.error("❌ [Chapa] Success response but checkout_url is missing!", response.data);
                        throw new ApiError(400, "Chapa returned success but no checkout URL was provided.");
                    }
                    console.log(`🔗 [Chapa] Checkout URL: ${checkout_url}`);
                } else {
                    const chapaMsg = response.data.message || "Chapa initialization failed";
                    console.error(`❌ [Chapa] Non-success status. Message: ${chapaMsg}`);
                    throw new ApiError(400, chapaMsg);
                }
            } catch (chapaErr) {
                // Re-throw ApiError instances directly (e.g. from the if/else above)
                if (chapaErr instanceof ApiError) throw chapaErr;

                if (chapaErr.response) {
                    // Chapa replied with an HTTP error
                    const httpStatus = chapaErr.response.status;
                    const chapaBody  = chapaErr.response.data;
                    const chapaMsg   = chapaBody?.message || "Chapa API rejected the request";
                    console.error(`❌ [Chapa] HTTP ${httpStatus} – ${chapaMsg}`);
                    console.error("❌ [Chapa] Full error body:", JSON.stringify(chapaBody, null, 2));
                    if (httpStatus === 401 || httpStatus === 403) {
                        console.error("🔑 [Chapa] DIAGNOSIS: API key is invalid or account cannot accept payments.");
                        console.error("   → Log in to https://dashboard.chapa.co and verify your API key.");
                    }
                    // Always 400 to client — never 401/500 (prevents auth-refresh cascade)
                    throw new ApiError(400, chapaMsg);
                } else if (chapaErr.code === "ECONNABORTED" || chapaErr.code === "ETIMEDOUT") {
                    console.error("❌ [Chapa] Request timed out after 15s.");
                    throw new ApiError(400, "Payment gateway timed out. Please try again.");
                } else {
                    console.error("❌ [Chapa] Network/unknown error:", chapaErr.message);
                    throw new ApiError(400, "Payment gateway communication failed. Please try again.");
                }
            }

            const payment = await Payment.create({
                student: studentId,
                subject: subjectId,
                tutor: subject.tutor,
                amount: finalAmount,
                method: "chapa",
                transactionId: tx_ref,
                status: status === "completed" ? "awaiting_approval" : status, // Never completed immediately
                tutorAmount: 0, // Set only upon approval
                adminAmount: 0  // Set only upon approval
            });

            console.log(`💾 [Payment] Record created in database: ${payment._id}`);

            return {
                checkout_url,
                tx_ref,
                simulated: status === "completed"
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            console.error("[Chapa Init Error]", error.response?.data || error.message);
            throw new ApiError(400, error.response?.data?.message || "Payment gateway communication failed");
        }
    }

    static async verifyPayment(transactionId) {
        try {
            const payment = await Payment.findOne({ transactionId })
                .populate("student", "name email")
                .populate("subject", "title tutor");
            
            if (!payment) throw new ApiError(404, "Payment record not found");

            // If already completed (e.g. simulated or already verified), return immediately
            if (payment.status === "completed") {
                return payment;
            }

            // Attempt to verify with Chapa
            try {
                const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${transactionId}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
                    }
                });

                if (response.data.status === "success") {
                    console.log(`✅ [Payment] Verification SUCCESS for ${transactionId}. Automating enrollment...`);
                    
                    payment.status = "approved";
                    payment.verified = true;
                    payment.verifiedAt = new Date();
                    payment.approvedAt = new Date(); // It's auto-approved now
                    
                    // Apply 70/30 Split
                    payment.tutorAmount = payment.amount * 0.7;
                    payment.adminAmount = payment.amount * 0.3;
                    
                    // Find a system admin to receive the 30% cut
                    const systemAdmin = await User.findOne({ role: { $in: ["admin", "manager"] } });
                    if (systemAdmin) {
                        payment.approvedBy = systemAdmin._id;
                        await User.findByIdAndUpdate(systemAdmin._id, { $inc: { earnings: payment.adminAmount } });
                    }

                    await payment.save();

                    // Update Tutor Earnings
                    if (payment.tutor) {
                        await User.findByIdAndUpdate(payment.tutor, { $inc: { earnings: payment.tutorAmount } });
                    }

                    // Enroll Student Immediately
                    const subject = await Subject.findById(payment.subject._id);
                    if (subject) {
                        const studentList = subject.students || [];
                        const isEnrolled = studentList.some(s => s.toString() === payment.student._id.toString());
                        if (!isEnrolled) {
                            subject.students.push(payment.student._id);
                            await subject.save();
                        }
                    }

                    // ── Notify student and tutor ──
                    const { NotificationService } = await import("../notifications/notification.service.js");
                    await NotificationService.notifyEnrollmentApproved(payment);
                    
                    console.log(`🎉 [Payment] Automation complete for ${transactionId}. Student enrolled.`);
                } else {
                    console.warn(`⚠️ [Payment] Chapa verification returned non-success status: ${response.data.status}`);
                    payment.status = "failed";
                    await payment.save();
                }
            } catch (chapaErr) {
                console.error("[Chapa Verify Error]", chapaErr.response?.data || chapaErr.message);
                // Keep as pending or update status if it's a definitive failure
            }

            return payment;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            console.error("[Chapa Verify Error]", error.response?.data || error.message);
            throw new ApiError(500, "Payment verification failed");
        }
    }

    static async approvePayment(paymentId, adminId) {
        const payment = await Payment.findById(paymentId)
            .populate("student", "name email")
            .populate("subject", "title tutor students");
        
        if (!payment) throw new ApiError(404, "Payment not found");
        if (payment.status !== "awaiting_approval") {
            throw new ApiError(400, "Payment is not awaiting approval");
        }

        payment.status = "approved";
        payment.verified = true;
        payment.approvedAt = new Date();
        payment.approvedBy = adminId;
        
        // Apply 70/30 Split
        payment.tutorAmount = payment.amount * 0.7;
        payment.adminAmount = payment.amount * 0.3;
        
        await payment.save();

        // ── Real Earnings Update ──
        // Update Tutor Earnings
        if (payment.tutor) {
            await User.findByIdAndUpdate(payment.tutor, { $inc: { earnings: payment.tutorAmount } });
        }
        // Update Approving Admin/Manager Earnings
        if (adminId) {
            await User.findByIdAndUpdate(adminId, { $inc: { earnings: payment.adminAmount } });
        }

        // Enroll Student
        const subject = await Subject.findById(payment.subject._id);
        if (subject) {
            const isEnrolled = subject.students.some(s => s.toString() === payment.student._id.toString());
            if (!isEnrolled) {
                subject.students.push(payment.student._id);
                await subject.save();
            }
        }

        // Notify Student and Tutor
        const { NotificationService } = await import("../notifications/notification.service.js");
        await NotificationService.notifyEnrollmentApproved(payment);

        return payment;
    }

    static async getPendingApprovals() {
        return await Payment.find({ status: "awaiting_approval" })
            .populate("student", "name email")
            .populate("subject", "title price")
            .sort({ createdAt: -1 });
    }

    static async getSubjectPayments(subjectId) {
        return await Payment.find({ subject: subjectId, status: { $in: ["approved", "completed"] } })
            .populate("student", "name email profile.avatar")
            .sort({ createdAt: -1 });
    }

    static async getTutorEarnings(tutorId) {
        const payments = await Payment.find({ tutor: tutorId, status: { $in: ["approved", "completed"] } })
            .populate("student", "name email profile.avatar")
            .populate("subject", "title")
            .sort({ createdAt: -1 });

        const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
        const tutorEarnings = payments.reduce((acc, p) => acc + (p.tutorAmount || 0), 0);
        
        return {
            totalRevenue,
            tutorEarnings,
            transactions: payments
        };
    }

    static async getAdminEarnings() {
        const payments = await Payment.find({ status: { $in: ["approved", "completed"] } })
            .populate("student", "name email")
            .populate("subject", "title")
            .sort({ createdAt: -1 });

        const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
        const adminEarnings = payments.reduce((acc, p) => acc + (p.adminAmount || 0), 0);

        return {
            totalRevenue,
            adminEarnings,
            transactions: payments
        };
    }

    static async checkEnrollment(studentId, subjectId) {
        console.log(`🔍 [Payment] Checking enrollment for Student: ${studentId}, Subject: ${subjectId}`);
        try {
            const student = await User.findById(studentId);
            const subject = await Subject.findById(subjectId);
            
            if (!subject) {
                console.error(`❌ [Payment] Subject NOT FOUND for enrollment check: ${subjectId}`);
                throw new ApiError(404, "Subject not found");
            }

            const studentList = subject.students || [];
            const alreadyEnrolled = studentList.some(
                (s) => s.toString() === studentId.toString()
            );

            const isGradeMatch = student && String(student.grade) === String(subject.grade);
            const isFreeEnrolled = subject.isFree && isGradeMatch;

            const completedPayment = await Payment.findOne({
                student: studentId,
                subject: subjectId,
                status: { $in: ["approved", "completed"] }
            });

            // Only block if the payment was actually verified by Chapa but is pending some other action
            const pendingPayment = await Payment.findOne({
                student: studentId,
                subject: subjectId,
                status: "awaiting_approval",
                verified: true
            });

            const result = {
                alreadyPaid: !!completedPayment || alreadyEnrolled || isFreeEnrolled,
                enrolled: alreadyEnrolled || isFreeEnrolled,
                awaitingApproval: !!pendingPayment && !alreadyEnrolled
            };

            console.log(`✅ [Payment] Enrollment Check Result for ${subjectId}:`, result);
            return result;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            console.error(`❌ [Payment] Enrollment Check ERROR for ${subjectId}:`, error.message);
            throw new ApiError(500, "Failed to check enrollment status");
        }
    }

    static async refundPayment(paymentId) {
        const payment = await Payment.findById(paymentId);
        if (!payment) throw new ApiError(404, "Payment not found");
        if (!["approved", "completed"].includes(payment.status)) {
            throw new ApiError(400, "Only approved or completed payments can be refunded");
        }

        // Reverse Earnings
        if (payment.tutor && payment.tutorAmount) {
            await User.findByIdAndUpdate(payment.tutor, { $inc: { earnings: -payment.tutorAmount } });
        }
        if (payment.approvedBy && payment.adminAmount) {
            await User.findByIdAndUpdate(payment.approvedBy, { $inc: { earnings: -payment.adminAmount } });
        }

        // Remove student from course
        const subject = await Subject.findById(payment.subject);
        if (subject) {
            subject.students = subject.students.filter(s => s.toString() !== payment.student.toString());
            await subject.save();
        }

        payment.status = "refunded";
        payment.refundedAt = new Date();
        await payment.save();

        return payment;
    }
}
