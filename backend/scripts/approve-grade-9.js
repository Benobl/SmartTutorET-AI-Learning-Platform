import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
}

mongoose.connect(uri).then(async () => {
    const db = mongoose.connection.db;
    
    console.log("Connected to DB. Approving Grade 9 subjects...");
    
    const result = await db.collection('subjects').updateMany(
        { grade: 9, status: "pending" },
        { $set: { status: "approved" } }
    );
    
    console.log(`✅ Approved ${result.modifiedCount} pending subjects for Grade 9.`);
    
    const allGrade9 = await db.collection('subjects').find({ grade: 9 })
        .project({ title: 1, status: 1 }).toArray();
        
    console.log("\n📊 Final Status for Grade 9:");
    allGrade9.forEach(s => console.log(`  - "${s.title}": ${s.status}`));
    
    mongoose.disconnect();
}).catch(e => {
    console.error('❌ DB connection error:', e.message);
    process.exit(1);
});
