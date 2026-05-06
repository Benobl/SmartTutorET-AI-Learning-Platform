import mongoose from 'mongoose';
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import User from '../src/modules/users/user.model.js';

const seedManager = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI is not defined in .env");
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const managerEmail = 'manager@smarttutor.com';
        const existingManager = await User.findOne({ email: managerEmail });

        if (existingManager) {
            console.log('Manager already exists. Updating password...');
            existingManager.password = 'password123';
            await existingManager.save();
            console.log('Password updated successfully.');
            process.exit(0);
        }

        const manager = await User.create({
            name: 'Platform Manager',
            email: managerEmail,
            password: 'password123',
            role: 'manager',
            isApproved: true,
            isVerified: true
        });

        console.log('Manager created successfully!');
        console.log('Email:', manager.email);
        console.log('Password: password123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding manager:', error);
        process.exit(1);
    }
};

seedManager();
