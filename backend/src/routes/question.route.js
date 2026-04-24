import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createQuestion,
    getAllQuestions,
    createAnswer,
    getAnswersByQuestion,
    upvoteQuestion,
    downvoteQuestion,
    deleteQuestion,
} from "../controllers/question.controller.js";

const router = express.Router();

router.post("/", protectRoute, createQuestion);
router.get("/", protectRoute, getAllQuestions);
router.post("/answers", protectRoute, createAnswer);
router.get("/answers/:questionId", protectRoute, getAnswersByQuestion);
router.post("/upvote/:questionId", protectRoute, upvoteQuestion);
router.post("/downvote/:questionId", protectRoute, downvoteQuestion);
router.delete("/:questionId", protectRoute, deleteQuestion);

export default router;
