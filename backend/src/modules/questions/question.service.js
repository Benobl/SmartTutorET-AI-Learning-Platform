import PeerQuestion from "../users/question.model.js";
import PeerAnswer from "../users/answer.model.js";

export class QuestionService {
    static async getAllQuestions() {
        return await PeerQuestion.find({})
            .populate("authorId", "fullName profilePic")
            .sort({ createdAt: -1 });
    }

    static async askQuestion(authorId, questionData) {
        return await PeerQuestion.create({
            ...questionData,
            authorId
        });
    }

    static async answerQuestion(authorId, questionId, content) {
        return await PeerAnswer.create({
            questionId,
            authorId,
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
