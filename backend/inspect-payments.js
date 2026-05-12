import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './src/modules/payments/payment.model.js';

dotenv.config();

const studentId = "6a0306cefd743283549c15d1";

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const payments = await Payment.find({ student: studentId });
        console.log(`Found ${payments.length} payments for student: ${studentId}`);
        
        payments.forEach(p => {
            console.log(`- ID: ${p._id}, Status: ${p.status}, Verified: ${p.verified}, TxRef: ${p.transactionId}, Created: ${p.createdAt}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error("Inspection failed:", error);
        process.exit(1);
    }
}

inspect();
