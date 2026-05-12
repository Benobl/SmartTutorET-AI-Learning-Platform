import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const healthyGroups = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const Group = mongoose.model("Group", new mongoose.Schema({ 
            name: String, 
            grade: Number,
            type: String,
            topic: String
        }), "studygroups");

        const result = await Group.updateMany(
            {},
            { 
                $set: { 
                    grade: 9, 
                    type: "private",
                    topic: "General Study" 
                } 
            }
        );
        console.log(`Updated ${result.modifiedCount} groups to be healthy (Grade 9, Private).`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

healthyGroups();
