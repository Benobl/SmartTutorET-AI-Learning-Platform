import { QuestionService } from "./question.service.js";

export class QuestionController {
    static async getAll(req, res, next) {
        try {
            const questions = await QuestionService.getAllQuestions();
            // Convert to format expected by frontend if necessary
            // For now, return array directly to match frontend expectation
            res.json(questions);
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const question = await QuestionService.askQuestion(req.user._id, req.body);
            res.status(201).json(question);
        } catch (error) {
            next(error);
        }
    }

    static async createAnswer(req, res, next) {
        try {
            const answer = await QuestionService.answerQuestion(req.user._id, req.body.questionId, req.body.content);
            res.status(201).json(answer);
        } catch (error) {
            next(error);
        }
    }

    static async upvote(req, res, next) {
        try {
            const question = await QuestionService.upvoteQuestion(req.params.questionId);
            res.json(question);
        } catch (error) {
            next(error);
        }
    }
}
