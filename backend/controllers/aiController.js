const { discoverPropertiesWithAI, parseUserPrompt } = require('../services/claudeService');
const User = require('../models/User');

// @desc    SelfCon AI conversational property discovery
// @route   POST /api/ai/discover
// @access  Public (Optional auth for personalization and saving search history)
exports.discoverProperties = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search prompt describing your property requirements.'
      });
    }

    const result = await discoverPropertiesWithAI(prompt);

    // Save recent search if user is authenticated
    if (req.user) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            recentSearches: {
              $each: [{ query: prompt, mode: result.parsedParameters?.mode || 'any', timestamp: new Date() }],
              $slice: -10 // Keep last 10 searches
            }
          }
        });
      } catch (err) {
        // Non-blocking
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Parse prompt entities without executing search
// @route   POST /api/ai/parse
// @access  Public
exports.parsePrompt = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt required' });
    }
    const parsed = await parseUserPrompt(prompt);
    res.status(200).json({ success: true, parsed });
  } catch (err) {
    next(err);
  }
};

