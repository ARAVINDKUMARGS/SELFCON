const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'name avatar role email phone')
      .populate('property', 'title location images pricing')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { conversation: req.params.conversationId, recipient: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message (creates conversation if not exists)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { recipientId, propertyId, text, conversationId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    let convo;

    if (conversationId) {
      convo = await Conversation.findById(conversationId);
    } else if (recipientId) {
      // Find existing or create new
      convo = await Conversation.findOne({
        participants: { $all: [req.user.id, recipientId] },
        ...(propertyId && { property: propertyId })
      });

      if (!convo) {
        convo = await Conversation.create({
          participants: [req.user.id, recipientId],
          property: propertyId || null
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Recipient or Conversation ID required' });
    }

    // Determine target recipient
    const recipient = convo.participants.find(p => p.toString() !== req.user.id) || recipientId;

    const message = await Message.create({
      conversation: convo._id,
      sender: req.user.id,
      recipient,
      text: text.trim()
    });

    convo.lastMessage = {
      text: text.trim(),
      sender: req.user.id,
      sentAt: new Date()
    };
    await convo.save();

    // Create notification
    await Notification.create({
      recipient,
      sender: req.user.id,
      type: 'new_message',
      title: 'New Message',
      message: `${req.user.name}: "${text.trim().substring(0, 60)}${text.trim().length > 60 ? '...' : ''}"`,
      link: `/messages`
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    res.status(201).json({
      success: true,
      message: populated,
      conversationId: convo._id
    });
  } catch (err) {
    next(err);
  }
};

