import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  email: String,
  grade: String,
  stream: String
});

const User = mongoose.model('User', userSchema);

async function updateGrade() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const result = await User.updateOne(
      { email: 'nebilbromance@gmail.com' },
      { $set: { grade: '9', stream: 'Common' } }
    );
    console.log(`Updated ${result.modifiedCount} user to Grade 9`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateGrade();
