import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const SubjectMapping = {
    '69fc63f64e2778f4b5826293': '69fba4c530063fe0f33fa7d1', // phy -> Physics
    '69fca37ba3edc12e838ccc00': '69fba4c530063fe0f33fa7d1', // physics -> Physics
    '69fc671c4e2778f4b58262ab': '69fba4c530063fe0f33fa7d4', // chem -> Chemistry
};

async function merge() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Deep Merge");

        const Payment = mongoose.model('Payment', new mongoose.Schema({ student: mongoose.Schema.Types.ObjectId, subject: mongoose.Schema.Types.ObjectId, status: String, createdAt: Date }, { strict: false }));
        const Subject = mongoose.model('Subject', new mongoose.Schema({ students: [mongoose.Schema.Types.ObjectId] }, { strict: false }));

        // 1. Move all payments to canonical subjects
        for (const [oldId, newId] of Object.entries(SubjectMapping)) {
            console.log(`Mapping payments from ${oldId} to ${newId}...`);
            const result = await Payment.updateMany(
                { subject: new mongoose.Types.ObjectId(oldId) },
                { $set: { subject: new mongoose.Types.ObjectId(newId) } }
            );
            console.log(`Updated ${result.modifiedCount} payments.`);
        }

        // 2. Remove duplicate payments for (student, canonical subject)
        // Keep the oldest 'completed' one if available, otherwise oldest overall.
        const allPayments = await Payment.find({}).sort({ createdAt: 1 });
        const seen = new Set();
        const toDelete = [];

        for (const p of allPayments) {
            const key = `${p.student}-${p.subject}`;
            if (seen.has(key)) {
                // If we already have a completed one and this is another one, delete it.
                // Or if we have any and this is another, delete it.
                toDelete.push(p._id);
            } else {
                if (p.status === 'completed') {
                    seen.add(key);
                }
                // If it's pending, we still might want to delete it if a completed one exists.
                // But for now, let's just keep the first one we see (oldest).
                // Actually, let's prefer completed ones.
            }
        }

        // RE-DUE THE LOGIC: 
        // Group by student-subject
        const groups = {};
        allPayments.forEach(p => {
            const key = `${p.student}-${p.subject}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });

        const finalToDelete = [];
        for (const key in groups) {
            const pList = groups[key];
            if (pList.length > 1) {
                // Find a completed one
                const completed = pList.find(p => p.status === 'completed');
                const winner = completed || pList[0]; // Prefer completed, else oldest
                pList.forEach(p => {
                    if (p._id.toString() !== winner._id.toString()) {
                        finalToDelete.push(p._id);
                    }
                });
            }
        }

        if (finalToDelete.length > 0) {
            console.log(`Deleting ${finalToDelete.length} redundant payments...`);
            await Payment.deleteMany({ _id: { $in: finalToDelete } });
        }

        // 3. Move students to canonical subjects and deduplicate
        for (const [oldId, newId] of Object.entries(SubjectMapping)) {
            const oldSubject = await Subject.findById(oldId);
            const newSubject = await Subject.findById(newId);
            
            if (oldSubject && newSubject) {
                console.log(`Merging students from ${oldId} to ${newId}...`);
                const allStudents = [...(newSubject.students || []), ...(oldSubject.students || [])];
                const uniqueStudents = [...new Set(allStudents.map(id => id.toString()))];
                newSubject.students = uniqueStudents.map(id => new mongoose.Types.ObjectId(id));
                await newSubject.save();
            }
        }

        // 4. Delete old subjects
        const oldSubjectIds = Object.keys(SubjectMapping).map(id => new mongoose.Types.ObjectId(id));
        console.log(`Deleting ${oldSubjectIds.length} duplicate subjects...`);
        await Subject.deleteMany({ _id: { $in: oldSubjectIds } });

        console.log("Deep merge and deduplication complete!");
        process.exit(0);
    } catch (err) {
        console.error("Merge failed:", err);
        process.exit(1);
    }
}

merge();
