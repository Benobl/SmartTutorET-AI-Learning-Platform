import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/users/user.model.js";

dotenv.config();

const testLoginMatch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const testCases = [
            { email: "admin@smarttutor.com", pass: "adminpassword" },
            { email: "manager@smarttutor.com", pass: "managerpassword" },
            { email: "nobleabdoo@gmail.com", pass: "tutorpassword" },
            { email: "nebilbromance@gmail.com", pass: "studentpassword" },
            { email: "nobleek@gmail.com", pass: "studentpassword" }
        ];

        for (const tc of testCases) {
            const user = await User.findOne({ email: tc.email }).select("+password");
            if (!user) {
                console.log(`[FAIL] ${tc.email}: User not found`);
                continue;
            }

            const isMatch = await user.matchPassword(tc.pass);
            console.log(`[RESULT] ${tc.email}: Match=${isMatch} | Hash=${user.password.substring(0, 10)}...`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

testLoginMatch();
