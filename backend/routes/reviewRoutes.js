const express = require('express');
const router = express.Router();
const {
  getPropertyReviews,
  addReview,
  replyToReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/property/:propertyId', getPropertyReviews);
router.post('/property/:propertyId', protect, addReview);
router.put('/:id/reply', protect, authorize('owner', 'seller', 'admin'), replyToReview);

module.exports = router;

