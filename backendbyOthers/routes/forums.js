const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  getPost,
  createReply,
  upvotePost,
  upvoteReply,
  acceptReply,
  pinPost
} = require('../controllers/forumController');

// NOTE: Static sub-paths (/replies/:id) must be defined before dynamic paths (/:postId)
// to avoid Express matching "replies" as a postId.

// PUT /replies/:replyId/upvote — toggle upvote on a reply
router.put('/replies/:replyId/upvote', auth, upvoteReply);

// PUT /replies/:replyId/accept — mark reply as accepted (tutor/manager only)
router.put('/replies/:replyId/accept', auth, authorize('tutor', 'manager'), acceptReply);

// GET / — get posts for a course (query: courseId, filter)
router.get('/', auth, getPosts);

// POST / — create a new post
router.post('/', auth, createPost);

// GET /:postId — get single post with replies
router.get('/:postId', auth, getPost);

// POST /:postId/replies — add a reply to a post
router.post('/:postId/replies', auth, createReply);

// PUT /:postId/upvote — toggle upvote on a post
router.put('/:postId/upvote', auth, upvotePost);

// PUT /:postId/pin — pin/unpin a post (tutor/manager only)
router.put('/:postId/pin', auth, authorize('tutor', 'manager'), pinPost);

module.exports = router;
