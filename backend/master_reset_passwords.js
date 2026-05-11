import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./src/modules/users/user.model.js";

dotenv.config();

const resetAllPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const accounts = [
            { email: "manager@smarttutor.com", pass: "managerpassword", role: "manager" },
            { email: "nobleabdoo@gmail.com", pass: "tutorpassword", role: "tutor" },
            { email: "nebilbromance@gmail.com", pass: "studentpassword", role: "student" },
            { email: "abel@student.com", pass: "studentpassword", role: "student" },
            { email: "sara@student.com", pass: "studentpassword", role: "student" },
            { email: "abrham@tutor.com", pass: "tutorpassword", role: "tutor" },
            { email: "tigist@tutor.com", pass: "tutorpassword", role: "tutor" }
        ];

        console.log("🚀 Starting Master Password Reset...");

        for (const acc of accounts) {
            const user = await User.findOne({ email: acc.email });
            if (user) {
                const hashedPassword = bcrypt.hashSync(acc.pass, 10);
                await User.updateOne(
                    { _id: user._id },
                    { 
                        $set: { 
                            password: hashedPassword,
                            isApproved: true,
                            isVerified: true,
                            tutorStatus: acc.role === "tutor" ? "approved" : "none"
                        } 
                    }
                );
                console.log(`✅ Reset SUCCESS: ${acc.email} -> ${acc.pass}`);
            } else {
                console.log(`ℹ️ Account not found, skipping: ${acc.email}`);
            }
        }

        console.log("\n✨ Master Reset Complete! You can now use the passwords listed above.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Master Reset Failed:", error);
        process.exit(1);
    }
};

resetAllPasswords();
