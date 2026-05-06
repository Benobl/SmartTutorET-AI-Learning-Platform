import express from "express";
import { QuestionController } from "./question.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, QuestionController.getAll);
router.get("/squad/:squadId", verifyToken, QuestionController.getBySquad);
router.get("/answers/:questionId", verifyToken, QuestionController.getAnswers);
router.post("/", verifyToken, QuestionController.create);
router.post("/answers", verifyToken, QuestionController.createAnswer);
router.post("/upvote/:questionId", verifyToken, QuestionController.upvote);

export default router;
