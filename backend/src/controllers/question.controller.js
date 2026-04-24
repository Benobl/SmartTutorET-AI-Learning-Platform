import PeerQuestion from "../models/PeerQuestion.js";
import PeerAnswer from "../models/PeerAnswer.js";

export const createQuestion = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const newQuestion = new PeerQuestion({
            author: req.user._id,
            title,
            content,
            tags,
        });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await PeerQuestion.find().populate("author", "fullName profilePic");
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAnswer = async (req, res) => {
    try {
        const { questionId, content } = req.body;
        const newAnswer = new PeerAnswer({
            questionId,
            author: req.user._id,
            content,
        });
        await newAnswer.save();
        res.status(201).json(newAnswer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnswersByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const answers = await PeerAnswer.find({ questionId }).populate("author", "fullName profilePic");
        res.status(200).json(answers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const upvoteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const question = await PeerQuestion.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        if (question.upvotes.includes(req.user._id)) {
            question.upvotes = question.upvotes.filter((id) => id.toString() !== req.user._id.toString());
        } else {
            question.upvotes.push(req.user._id);
            question.downvotes = question.downvotes.filter((id) => id.toString() !== req.user._id.toString());
        }

        await question.save();
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const downvoteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const question = await PeerQuestion.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        if (question.downvotes.includes(req.user._id)) {
            question.downvotes = question.downvotes.filter((id) => id.toString() !== req.user._id.toString());
        } else {
            question.downvotes.push(req.user._id);
            question.upvotes = question.upvotes.filter((id) => id.toString() !== req.user._id.toString());
        }

        await question.save();
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const question = await PeerQuestion.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });
        if (question.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await PeerQuestion.findByIdAndDelete(questionId);
        res.status(200).json({ message: "Question deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
