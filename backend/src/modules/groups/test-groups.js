import mongoose from "mongoose";
import Group from "../social/group.model.js";
import User from "../auth/user.model.js";
import { GroupService } from "./group.service.js";

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const userId = "some_user_id"; // I need a real ID
    try {
        const groups = await GroupService.getUserGroups(userId);
        console.log("Groups:", groups);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}
// test();
