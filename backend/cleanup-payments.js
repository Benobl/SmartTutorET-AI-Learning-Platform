import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './src/modules/payments/payment.model.js';

dotenv.config();

const studentId = "6a0306cefd743283549c15d1";

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        console.log(`Cleaning up stale payments for student: ${studentId}...`);
        
        const result = await Payment.deleteMany({
            student: studentId,
            verified: { $ne: true },
            status: { $in: ["awaiting_approval", "pending", "failed", "initialized"] }
        });

        console.log(`Successfully deleted ${result.deletedCount} stale payment records.`);
        
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

cleanup();
