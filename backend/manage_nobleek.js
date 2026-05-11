import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./src/modules/users/user.model.js";

dotenv.config();

const manageUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const email = "nobleek@gmail.com";
        const pass = "studentpassword"; // Default for demo

        let user = await User.findOne({ email });
        
        if (user) {
            console.log(`ℹ️ User ${email} found. Resetting password...`);
            const hashedPassword = bcrypt.hashSync(pass, 10);
            await User.updateOne(
                { _id: user._id },
                { 
                    $set: { 
                        password: hashedPassword,
                        isApproved: true,
                        isVerified: true
                    } 
                }
            );
            console.log(`✅ Reset SUCCESS: ${email} -> ${pass}`);
        } else {
            console.log(`ℹ️ User ${email} NOT found. Creating as Student...`);
            const hashedPassword = bcrypt.hashSync(pass, 10);
            await User.create({
                name: "Noble Ek",
                email: email,
                password: hashedPassword,
                role: "student",
                isApproved: true,
                isVerified: true,
                grade: 12,
                stream: "Natural Science"
            });
            console.log(`✅ Created SUCCESS: ${email} -> ${pass}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Operation Failed:", error);
        process.exit(1);
    }
};

manageUser();
