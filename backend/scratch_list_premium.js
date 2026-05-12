import "dotenv/config";
import mongoose from "mongoose";
import Subject from "./src/modules/courses/subject.model.js";

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
await mongoose.connect(uri);
const premiumSubjects = await Subject.find({ $or: [{ isPremium: true }, { price: { $gt: 0 } }] }).limit(5);
console.log("💰 PREMIUM SUBJECTS:");
premiumSubjects.forEach(s => console.log(`- ${s.title} (ID: ${s._id}, Price: ${s.price})`));
process.exit(0);
