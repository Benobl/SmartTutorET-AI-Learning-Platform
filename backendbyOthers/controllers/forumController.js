const ForumPost = require('../models/ForumPost');
const ForumReply = require('../models/ForumReply');

// Get posts for a course with optional filters
const getPosts = async (req, res) => {
  try {
    const { courseId, filter = 'all' } = req.query;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'courseId query parameter is required' });
    }

    const query = { course: courseId };

    if (filter === 'unanswered') {
      query.replyCount = 0;
    } else if (filter === 'pinned') {
      query.isPinned = true;
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'firstName lastName avatar role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new forum post
const createPost = async (req, res) => {
  try {
    const { course, title, body, tags } = req.body;

    const post = new ForumPost({
      course,
      title,
      body,
      tags: tags || [],
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'firstName lastName avatar role');

    res.status(201).json({ success: true, message: 'Post created successfully', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single post with its replies
const getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId)
      .populate('author', 'firstName lastName avatar role');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const replies = await ForumReply.find({ post: post._id })
      .populate('author', 'firstName lastName avatar role')
      .sort({ isAccepted: -1, createdAt: 1 });

    res.json({ success: true, data: { post, replies } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a reply to a post
const createReply = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const reply = new ForumReply({
      post: post._id,
      author: req.user._id,
      body: req.body.body
    });

    await reply.save();

    // Increment reply count on the post
    post.replyCount += 1;
    post.updatedAt = Date.now();
    await post.save();

    await reply.populate('author', 'firstName lastName avatar role');

    res.status(201).json({ success: true, message: 'Reply added', data: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle upvote on a post
const upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id;
    const alreadyUpvoted = post.upvotes.some(id => id.toString() === userId.toString());

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
      post.upvotes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyUpvoted ? 'Upvote removed' : 'Post upvoted',
      upvoteCount: post.upvotes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle upvote on a reply
const upvoteReply = async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const userId = req.user._id;
    const alreadyUpvoted = reply.upvotes.some(id => id.toString() === userId.toString());

    if (alreadyUpvoted) {
      reply.upvotes = reply.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
      reply.upvotes.push(userId);
    }

    await reply.save();

    res.json({
      success: true,
      message: alreadyUpvoted ? 'Upvote removed' : 'Reply upvoted',
      upvoteCount: reply.upvotes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a reply as the accepted answer (tutor/manager only)
const acceptReply = async (req, res) => {
  try {
    const reply = await ForumReply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const post = await ForumPost.findById(reply.post);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Unaccept any previously accepted reply for this post
    await ForumReply.updateMany({ post: post._id, isAccepted: true }, { isAccepted: false });

    reply.isAccepted = true;
    await reply.save();

    post.isResolved = true;
    post.updatedAt = Date.now();
    await post.save();

    res.json({ success: true, message: 'Reply accepted as answer, post marked as resolved', data: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pin or unpin a post (tutor/manager only)
const pinPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.isPinned = !post.isPinned;
    post.updatedAt = Date.now();
    await post.save();

    res.json({
      success: true,
      message: post.isPinned ? 'Post pinned' : 'Post unpinned',
      data: post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  getPost,
  createReply,
  upvotePost,
  upvoteReply,
  acceptReply,
  pinPost
};
