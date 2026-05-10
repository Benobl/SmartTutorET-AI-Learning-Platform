import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const PaymentSchema = new mongoose.Schema({
    student: mongoose.Schema.Types.ObjectId,
    subject: mongoose.Schema.Types.ObjectId,
    status: String,
    amount: Number,
    createdAt: Date
}, { strict: false });

const Payment = mongoose.model('Payment', PaymentSchema);

async function list() {
    await mongoose.connect(MONGO_URI);
    const payments = await Payment.find({}).populate({ path: 'student', select: 'name email', model: mongoose.model('User', new mongoose.Schema({}, {strict: false})) }).populate({ path: 'subject', select: 'title', model: mongoose.model('Subject', new mongoose.Schema({}, {strict: false})) });
    
    console.log("ALL PAYMENTS:");
    payments.forEach(p => {
        console.log(`ID: ${p._id} | Student: ${p.student?.name} | Subject: ${p.subject?.title} | Status: ${p.status} | Amount: ${p.amount} | Date: ${p.createdAt}`);
    });
    process.exit(0);
}

list();
