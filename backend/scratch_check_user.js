import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'nobleek514@gmail.com' });
        if (user) {
            console.log('User found:', JSON.stringify(user, null, 2));
        } else {
            console.log('User not found');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();
