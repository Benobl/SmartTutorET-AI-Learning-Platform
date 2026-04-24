import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import * as userController from "../controllers/user.controller.js"

const router = express.Router()

//apply auth middleware to all routes
router.use(protectRoute)

router.get('/', userController.getRecommendedUsers)
router.get('/friends', userController.getMyFriends)
router.post("/friend-request/:id", userController.sendFriendRequest)
router.put("/friend-request/:id/accept", userController.acceptFriendRequest)
router.get("/friend-requests", userController.getFriendRequest)
router.get("/outgoing-friend-requests", userController.getOutgoingFriendReqs)
router.get("/students", userController.getAllStudents)
router.get("/search", userController.searchUserByEmail)

export default router;
