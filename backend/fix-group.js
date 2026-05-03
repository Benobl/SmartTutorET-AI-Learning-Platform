import mongoose from "mongoose";
import "dotenv/config";
import Group from "./src/modules/social/group.model.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const group = await Group.findById("69ed988acce4952990bd2665");
    if (group) {
        if (!group.createdBy) {
            console.log("Fixing createdBy...");
            group.createdBy = group.members && group.members.length > 0 ? group.members[0] : new mongoose.Types.ObjectId("60d21b4667d0d8992e610c85");
            await group.save();
            console.log("Fixed group createdBy!");
        } else {
            console.log("Group already has createdBy:", group.createdBy);
        }
    } else {
        console.log("Group not found");
    }
  } catch (e) {
      console.error(e);
  } finally {
      process.exit(0);
  }
}
run();
