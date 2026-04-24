import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createGroup,
    getAllGroups,
    getMyGroups,
    joinGroup,
    leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getAllGroups);
router.get("/mine", protectRoute, getMyGroups);
router.post("/join/:groupId", protectRoute, joinGroup);
router.post("/leave/:groupId", protectRoute, leaveGroup);

export default router;
