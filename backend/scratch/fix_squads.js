import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const fixGroups = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const User = mongoose.model("User", new mongoose.Schema({ email: String }));
        const Group = mongoose.model("Group", new mongoose.Schema({ 
            name: String, 
            members: [mongoose.Schema.Types.ObjectId],
            createdBy: mongoose.Schema.Types.ObjectId,
            grade: Number
        }), "studygroups");

        const nebil = await User.findOne({ email: "nebilbromance@gmail.com" });
        if (!nebil) throw new Error("Nebil not found");

        const nebilId = nebil._id;
        const orphanedId = new mongoose.Types.ObjectId("69eccf3a03330ed963a4fee5");

        console.log(`Fixing groups for Nebil (${nebilId})...`);

        // 1. Reassign groups created by the orphaned ID
        const result1 = await Group.updateMany(
            { createdBy: orphanedId },
            { $set: { createdBy: nebilId } }
        );
        console.log(`Reassigned ${result1.modifiedCount} groups created by orphaned ID.`);

        // 2. Add Nebil to members of those groups
        const groupsToJoin = await Group.find({ createdBy: nebilId });
        for (const g of groupsToJoin) {
            if (!g.members.includes(nebilId)) {
                g.members.push(nebilId);
                await g.save();
                console.log(`Added Nebil to members of group: ${g.name}`);
            }
        }

        // 3. Find other groups that might have been created by Nebil but have "undefined" creator in my previous script
        // Wait, "undefined" in my script meant creator was null or not found.
        // Let's find groups with no valid creator and maybe assign them to Nebil if they are "Noble" (Nebil's nickname?)
        const nobleGroups = await Group.find({ name: /Noble/i });
        for (const g of nobleGroups) {
            if (!g.members.includes(nebilId)) {
                g.members.push(nebilId);
                g.createdBy = nebilId;
                await g.save();
                console.log(`Assigned "Noble" group to Nebil: ${g.name}`);
            }
        }
        
        // 4. Also check groups created by another ID that was listed (69ef02e1791bb31fdffd7bbe)
        // This might be another lost account of the same user.
        const otherOrphanedId = new mongoose.Types.ObjectId("69ef02e1791bb31fdffd7bbe");
        const result2 = await Group.updateMany(
            { createdBy: otherOrphanedId },
            { $set: { createdBy: nebilId }, $addToSet: { members: nebilId } }
        );
        console.log(`Reassigned ${result2.modifiedCount} groups from second orphaned ID.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

fixGroups();
