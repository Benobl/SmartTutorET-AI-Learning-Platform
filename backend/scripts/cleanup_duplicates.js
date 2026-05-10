import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
}

// Define minimal schemas for cleanup
const PaymentSchema = new mongoose.Schema({
    student: mongoose.Schema.Types.ObjectId,
    subject: mongoose.Schema.Types.ObjectId,
    status: String,
    createdAt: Date
}, { strict: false });

const SubjectSchema = new mongoose.Schema({
    students: [mongoose.Schema.Types.ObjectId]
}, { strict: false });

const Payment = mongoose.model('Payment', PaymentSchema);
const Subject = mongoose.model('Subject', SubjectSchema);

async function cleanup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Cleanup Duplicate Payments
        const allPayments = await Payment.find({ status: 'completed' }).sort({ createdAt: 1 });
        const seen = new Set();
        const duplicates = [];

        for (const p of allPayments) {
            const key = `${p.student}-${p.subject}`;
            if (seen.has(key)) {
                duplicates.push(p._id);
            } else {
                seen.add(key);
            }
        }

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} duplicate payments. Deleting...`);
            await Payment.deleteMany({ _id: { $in: duplicates } });
            console.log("Duplicate payments deleted.");
        } else {
            console.log("No duplicate payments found.");
        }

        // 2. Cleanup Subject Students (Unique)
        const subjects = await Subject.find({});
        for (const s of subjects) {
            if (!s.students || s.students.length === 0) continue;
            
            const originalLength = s.students.length;
            const uniqueStudents = [...new Set(s.students.map(id => id.toString()))];
            
            if (uniqueStudents.length < originalLength) {
                console.log(`Cleaning duplicates for subject ${s._id}. ${originalLength} -> ${uniqueStudents.length}`);
                s.students = uniqueStudents.map(id => new mongoose.Types.ObjectId(id));
                await s.save();
            }
        }

        console.log("Cleanup complete!");
        process.exit(0);
    } catch (err) {
        console.error("Cleanup failed:", err);
        process.exit(1);
    }
}

cleanup();
