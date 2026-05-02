import { QuestionService } from "./question.service.js";

export class QuestionController {
    static async getAll(req, res, next) {
        try {
            const questions = await QuestionService.getAllQuestions();
            res.json({ success: true, data: questions });
        } catch (error) {
            next(error);
        }
    }

    static async getBySquad(req, res, next) {
        try {
            const questions = await QuestionService.getSubjectQuestions(req.params.squadId);
            res.json({ success: true, data: questions });
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const question = await QuestionService.askQuestion(req.user._id, req.body);
            res.status(201).json({ success: true, data: question });
        } catch (error) {
            next(error);
        }
    }

    static async getAnswers(req, res, next) {
        try {
            const answers = await QuestionService.getAnswers(req.params.questionId);
            res.json({ success: true, data: answers });
        } catch (error) {
            next(error);
        }
    }

    static async createAnswer(req, res, next) {
        try {
            const answer = await QuestionService.answerQuestion(req.user._id, req.body.questionId, req.body.content);
            res.status(201).json({ success: true, data: answer });
        } catch (error) {
            next(error);
        }
    }

    static async upvote(req, res, next) {
        try {
            const question = await QuestionService.upvoteQuestion(req.params.questionId, req.user._id);
            res.json({ success: true, data: question });
        } catch (error) {
            next(error);
        }
    }
}
