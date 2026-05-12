import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/modules/users/user.model.js";

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ No MONGO_URI found in .env");
  process.exit(1);
}

await mongoose.connect(uri);
const students = await User.find({ role: "student" }).limit(5);
console.log("🎓 STUDENTS:");
students.forEach(s => console.log(`- ${s.email} (Grade: ${s.grade})`));
process.exit(0);
