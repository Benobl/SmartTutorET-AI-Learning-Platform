import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    
    const subjects = await db.collection('subjects').find({}).limit(20)
        .project({ title: 1, grade: 1, status: 1, tutor: 1 }).toArray();
    console.log('📚 Subjects in DB:');
    subjects.forEach(s => console.log(`  - "${s.title}" | Grade: ${s.grade} | Status: ${s.status} | Tutor: ${s.tutor}`));
    
    if (subjects.length === 0) {
        console.log('  ⚠️  No subjects found in database!');
    }

    const counts = await db.collection('subjects').aggregate([
        { $group: { _id: '$grade', count: { $sum: 1 } } }
    ]).toArray();
    console.log('\n📊 Subjects by grade:', JSON.stringify(counts));

    mongoose.disconnect();
}).catch(e => console.error('DB error:', e.message));
