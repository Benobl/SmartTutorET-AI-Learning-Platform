
import mongoose from "mongoose";
import { UserService } from "../src/modules/users/user.service.js";
import User from "../src/modules/users/user.model.js";

async function testStats() {
    await mongoose.connect("mongodb+srv://nebilbromance_db_user:a9icx9Qh1v00qran@cluster0.d38tvxt.mongodb.net/streamify_db?appName=Cluster0");
    
    const tutorEmail = "nobleek514@gmail.com";
    const tutor = await User.findOne({ email: tutorEmail });
    
    if (!tutor) {
        console.log("Tutor not found");
        process.exit(1);
    }
    
    console.log("Calling getTutorStats for:", tutor._id);
    const stats = await UserService.getTutorStats(tutor._id.toString());
    
    console.log("Stats returned by service:", stats);
    
    process.exit(0);
}

testStats();
