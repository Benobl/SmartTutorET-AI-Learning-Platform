import mongoose from "mongoose";
import "dotenv/config";
import User from "../src/modules/users/user.model.js";
import Subject from "../src/modules/courses/subject.model.js";
import { PaymentService } from "../src/modules/payments/payment.service.js";

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const student = await User.findOne({ email: "nebilbromance@gmail.com" });
        if (!student) {
            console.log("❌ Student not found");
            process.exit(1);
        }
        console.log(`✅ Found student: ${student.email} (${student._id})`);

        const subject = await Subject.findOne({ price: { $gt: 0 } });
        if (!subject) {
            console.log("❌ No premium subject found");
            process.exit(1);
        }
        console.log(`✅ Found premium subject: ${subject.title} (${subject._id}) at ${subject.price} ETB`);

        // Force remove student from subject and DELETE existing payments if they exist for testing
        subject.students = subject.students.filter(s => s.toString() !== student._id.toString());
        await subject.save();
        
        const Payment = (await import("../src/modules/payments/payment.model.js")).default;
        await Payment.deleteMany({ student: student._id, subject: subject._id });
        console.log("✅ Cleaned enrollment and existing payments for testing");

        console.log("\n--- STARTING PAYMENT INITIALIZATION ---");
        const result = await PaymentService.initializePayment(
            student._id,
            subject._id,
            subject.price,
            "chapa"
        );

        console.log("\n--- RESULT ---");
        console.log(JSON.stringify(result, null, 2));

        if (result.checkout_url) {
            console.log("\n✅ SUCCESS: Checkout URL generated!");
        } else {
            console.log("\n❌ FAILURE: No checkout URL");
        }

    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    } finally {
        await mongoose.disconnect();
    }
}

run();
