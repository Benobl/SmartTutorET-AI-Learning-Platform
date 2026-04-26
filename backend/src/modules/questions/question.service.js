import PeerQuestion from "../users/question.model.js";
import PeerAnswer from "../users/answer.model.js";

export class QuestionService {
    static async getAllQuestions(filters = {}) {
        return await PeerQuestion.find(filters)
            .populate("author", "fullName profilePic")
            .sort({ createdAt: -1 });
    }

    static async getSquadQuestions(squadId) {
        return await this.getAllQuestions({ squadId });
    }

    static async askQuestion(authorId, questionData) {
        return await PeerQuestion.create({
            ...questionData,
            author: authorId
        });
    }

    static async getAnswers(questionId) {
        return await PeerAnswer.find({ questionId })
            .populate("author", "fullName profilePic")
            .sort({ createdAt: 1 });
    }

    static async answerQuestion(authorId, questionId, content) {
        return await PeerAnswer.create({
            questionId,
            author: authorId,
            content
        });
    }

    static async upvoteQuestion(questionId) {
        return await PeerQuestion.findByIdAndUpdate(
            questionId,
            { $inc: { likes: 1 } },
            { new: true }
        );
    }
}
