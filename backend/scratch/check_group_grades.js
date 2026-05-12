import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const checkGroupGrades = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const Group = mongoose.model("Group", new mongoose.Schema({ 
            name: String, 
            grade: Number,
            type: String
        }), "studygroups");

        const groups = await Group.find({});
        for (const g of groups) {
            console.log(`- Group: ${g.name}, Grade: ${g.grade}, Type: ${g.type}`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

checkGroupGrades();
