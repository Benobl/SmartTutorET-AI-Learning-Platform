import PeerQuestion from "../social/question.model.js";
import PeerAnswer from "../social/answer.model.js";

export class QuestionService {
    static async getAllQuestions(filters = {}) {
        return await PeerQuestion.find(filters)
            .populate("author", "name profile.avatar")
            .sort({ createdAt: -1 });
    }

    static async getSubjectQuestions(subject) {
        return await this.getAllQuestions({ subject });
    }

    static async askQuestion(authorId, questionData) {
        return await PeerQuestion.create({
            ...questionData,
            author: authorId
        });
    }

    static async getAnswers(question) {
        return await PeerAnswer.find({ question })
            .populate("author", "name profile.avatar")
            .sort({ createdAt: 1 });
    }

    static async answerQuestion(authorId, question, content) {
        return await PeerAnswer.create({
            question,
            author: authorId,
            content
        });
    }

    static async upvoteQuestion(questionId, userId) {
        const question = await PeerQuestion.findById(questionId);
        if (!question) throw new ApiError(404, "Question not found");

        const index = question.upvotes.findIndex(id => id.toString() === userId.toString());
        if (index === -1) {
            question.upvotes.push(userId);
            // Remove from downvotes if present
            const downIndex = question.downvotes.findIndex(id => id.toString() === userId.toString());
            if (downIndex !== -1) question.downvotes.splice(downIndex, 1);
        } else {
            question.upvotes.splice(index, 1); // Toggle upvote
        }

        return await question.save();
    }
}
