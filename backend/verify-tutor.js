import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/users/user.model.js";

dotenv.config();

async function checkTutor() {
    await mongoose.connect(process.env.MONGO_URI);
    const tutor = await User.findOne({ email: "nobleek514@gmail.com" });
    if (tutor) {
        console.log("Tutor found:", tutor.email, "Status:", tutor.tutorStatus);
        if (tutor.tutorStatus !== "approved") {
            tutor.tutorStatus = "approved";
            tutor.isApproved = true;
            await tutor.save();
            console.log("Tutor status updated to approved.");
        }
    } else {
        console.log("Tutor nobleek514@gmail.com not found.");
    }
    await mongoose.disconnect();
}

checkTutor();
