const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// Send message
router.post('/', auth, messageController.sendMessage);

// Get group messages
router.get('/:groupId', auth, messageController.getGroupMessages);

module.exports = router;
