import mongoose from "mongoose";
import "dotenv/config";
import Group from "./src/modules/social/group.model.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const group = await Group.findById("69ed988acce4952990bd2665");
  console.log("Group:", group);
  console.log("Members:", group?.members);
  console.log("CreatedBy:", group?.createdBy);
  process.exit(0);
}
run();
