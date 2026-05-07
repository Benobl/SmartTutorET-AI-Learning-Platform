import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true },
  role: String,
  isApproved: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  tutorStatus: String
});

const User = mongoose.model('User', userSchema);

async function fixUsers() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Fix missing isApproved/isVerified for all non-tutors
    const result = await User.updateMany(
      { role: { $ne: 'tutor' }, isApproved: { $exists: false } },
      { $set: { isApproved: true } }
    );
    console.log(`Updated ${result.modifiedCount} users to isApproved: true`);

    const result2 = await User.updateMany(
      { isVerified: { $exists: false } },
      { $set: { isVerified: true } }
    );
    console.log(`Updated ${result2.modifiedCount} users to isVerified: true`);

    // 2. Reset manager password to 'password123'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    await User.updateOne(
      { email: 'manager@smarttutor.com' },
      { $set: { password: hashedPassword, isApproved: true, isVerified: true } }
    );
    console.log('Reset manager@smarttutor.com password to "password123"');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixUsers();
