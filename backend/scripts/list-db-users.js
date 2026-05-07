import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  isApproved: Boolean,
  tutorStatus: String
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const users = await User.find({}, 'email role isApproved tutorStatus');
    console.log('--- Users in Database ---');
    users.forEach(u => {
      console.log(`Email: ${u.email} | Role: ${u.role} | Approved: ${u.isApproved} | Status: ${u.tutorStatus}`);
    });
    console.log('-------------------------');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
