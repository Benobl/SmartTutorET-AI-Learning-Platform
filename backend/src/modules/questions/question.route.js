import express from "express";
import { QuestionController } from "./question.controller.js";
import { protectRoute } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, QuestionController.getAll);
router.get("/squad/:squadId", protectRoute, QuestionController.getBySquad);
router.get("/answers/:questionId", protectRoute, QuestionController.getAnswers);
router.post("/", protectRoute, QuestionController.create);
router.post("/answers", protectRoute, QuestionController.createAnswer);
router.post("/upvote/:questionId", protectRoute, QuestionController.upvote);

export default router;
