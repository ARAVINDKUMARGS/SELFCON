const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;

