import mongoose from 'mongoose';
import User from './src/modules/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findById('69f1bbdf724cc355beedd4e1');
        if (user) {
            console.log(`User with ID 69f1bbdf724cc355beedd4e1 is: ${user.name} (${user.email})`);
        } else {
            console.log("User with ID 69f1bbdf724cc355beedd4e1 not found");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
