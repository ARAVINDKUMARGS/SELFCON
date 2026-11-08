const express = require('express');
const router = express.Router();
const {
  submitOffer,
  getMyOffers,
  getSellerOffers,
  respondToOffer,
  scheduleVisit
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, submitOffer);
router.post('/schedule-visit', protect, scheduleVisit);
router.get('/my-offers', protect, getMyOffers);
router.get('/seller-offers', protect, authorize('owner', 'seller', 'admin'), getSellerOffers);
router.put('/:id/respond', protect, authorize('owner', 'seller', 'admin'), respondToOffer);

module.exports = router;

