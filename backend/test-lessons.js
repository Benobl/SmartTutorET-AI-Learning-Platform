import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const course = await db.collection('courses').findOne({});
  console.log(JSON.stringify(course.lessons, null, 2));
  process.exit(0);
});
