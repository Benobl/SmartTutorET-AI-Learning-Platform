import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const inspectGroups = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI not found in .env");
        
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const User = mongoose.model("User", new mongoose.Schema({ email: String, fullName: String }));
        const Group = mongoose.model("Group", new mongoose.Schema({ 
            name: String, 
            members: [mongoose.Schema.Types.ObjectId],
            createdBy: mongoose.Schema.Types.ObjectId
        }), "studygroups");

        const groups = await Group.find({});
        console.log(`Found ${groups.length} groups total.`);

        for (const g of groups) {
            const creator = await User.findById(g.createdBy);
            console.log(`- Group: ${g.name}, Creator: ${creator?.email || g.createdBy}, Members Count: ${g.members.length}`);
        }

        const nebil = await User.findOne({ email: "nebilbromance@gmail.com" });
        if (nebil) {
            console.log(`Nebil ID: ${nebil._id}`);
            const nebilGroups = await Group.find({ members: nebil._id });
            console.log(`Nebil is member of ${nebilGroups.length} groups.`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

inspectGroups();
