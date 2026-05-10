import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function backfillEarnings() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const paymentSchema = new mongoose.Schema({}, { strict: false });
        const Payment = mongoose.model("Payment_Backfill", paymentSchema, "payments");

        const subjectSchema = new mongoose.Schema({}, { strict: false });
        const Subject = mongoose.model("Subject_Backfill", subjectSchema, "subjects");

        const payments = await Payment.find({ status: "completed" });
        console.log(`Found ${payments.length} completed payments.`);

        let updatedCount = 0;
        for (const payment of payments) {
            const subject = await Subject.findById(payment.subject);
            if (subject) {
                const tutorId = subject.tutor;
                const tutorAmount = (payment.amount || 0) * 0.7;
                const adminAmount = (payment.amount || 0) * 0.3;

                await Payment.findByIdAndUpdate(payment._id, {
                    $set: {
                        tutor: tutorId,
                        tutorAmount: tutorAmount,
                        adminAmount: adminAmount
                    }
                });
                updatedCount++;
            }
        }

        console.log(`Successfully backfilled ${updatedCount} payments.`);
        process.exit(0);
    } catch (error) {
        console.error("Backfill failed:", error);
        process.exit(1);
    }
}

backfillEarnings();
