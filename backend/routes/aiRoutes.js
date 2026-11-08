const express = require('express');
const router = express.Router();
const { discoverProperties, parsePrompt } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.post('/discover', optionalAuth, discoverProperties);
router.post('/parse', parsePrompt);

module.exports = router;

