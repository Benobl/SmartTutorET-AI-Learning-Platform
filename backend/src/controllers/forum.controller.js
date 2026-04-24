import Forum from "../models/Forum.js";
import Thread from "../models/Thread.js";
import Post from "../models/Post.js";

export const createForum = async (req, res) => {
    try {
        const { title, description, type, relatedId, typeModel } = req.body;
        const newForum = new Forum({ title, description, type, relatedId, typeModel });
        await newForum.save();
        res.status(201).json(newForum);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createThread = async (req, res) => {
    try {
        const { forumId, title, content, tags } = req.body;
        const newThread = new Thread({
            forumId,
            author: req.user._id,
            title,
            content,
            tags,
        });
        await newThread.save();
        res.status(201).json(newThread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getThreadsByForum = async (req, res) => {
    try {
        const { forumId } = req.params;
        const threads = await Thread.find({ forumId }).populate("author", "fullName profilePic");
        res.status(200).json(threads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const { threadId, content, parentPostId } = req.body;
        const newPost = new Post({
            threadId,
            author: req.user._id,
            content,
            parentPostId,
        });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPostsByThread = async (req, res) => {
    try {
        const { threadId } = req.params;
        const posts = await Post.find({ threadId }).populate("author", "fullName profilePic");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
