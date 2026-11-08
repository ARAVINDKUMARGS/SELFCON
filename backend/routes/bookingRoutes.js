const express = require('express');
const router = express.Router();
const {
  createBooking,
  confirmPayment,
  getUserBookings,
  getHostBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.post('/:id/confirm-payment', protect, confirmPayment);
router.get('/my-bookings', protect, getUserBookings);
router.get('/host-bookings', protect, authorize('owner', 'seller', 'admin'), getHostBookings);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;

