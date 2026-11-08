const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const { validateBookingRequest } = require('../services/bookingValidationService');
const { createPaymentOrder, verifyPayment } = require('../services/paymentService');

// @desc    Initiate a new booking request with server validation and payment order
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, checkInDate, checkOutDate, guests, bookingMode, specialRequests, provider = 'test' } = req.body;

    // Validate dates, conflicts, and calculate authorized pricing
    const validation = await validateBookingRequest({
      propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      bookingMode: bookingMode || 'stay'
    });

    // Create payment order
    const paymentOrder = await createPaymentOrder({
      amount: validation.pricing.totalAmount,
      currency: validation.pricing.currency,
      receipt: `bkg_${Date.now()}`,
      notes: { propertyId, userId: req.user.id }
    });

    // Create booking record with 'pending' status until payment is confirmed
    const booking = await Booking.create({
      property: propertyId,
      user: req.user.id,
      host: validation.property.owner,
      bookingMode: validation.bookingMode,
      checkInDate: validation.checkInDate,
      checkOutDate: validation.checkOutDate,
      guests: guests || { adults: 1, children: 0, pets: 0 },
      pricing: validation.pricing,
      status: 'pending',
      payment: {
        provider: paymentOrder.provider,
        orderId: paymentOrder.orderId,
        paymentStatus: 'pending'
      },
      specialRequests: specialRequests || ''
    });

    // Create notification for host
    await Notification.create({
      recipient: validation.property.owner,
      sender: req.user.id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${req.user.name} requested to book "${validation.property.title}" for ${validation.unitsCount} ${validation.bookingMode === 'stay' ? 'nights' : 'months'}.`,
      link: `/dashboard/owner`
    });

    res.status(201).json({
      success: true,
      message: 'Booking initiated successfully',
      booking,
      paymentOrder
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm booking payment and lock calendar dates
// @route   POST /api/bookings/:id/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const booking = await Booking.findById(req.params.id).populate('property');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Verify payment
    const verification = verifyPayment({
      orderId,
      paymentId,
      signature,
      provider: booking.payment.provider
    });

    if (!verification.verified) {
      booking.payment.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.payment.paymentStatus = 'paid';
    booking.payment.paymentId = verification.paymentId;
    booking.payment.paidAt = new Date();
    await booking.save();

    // Lock dates on property availability calendar to guarantee no double-booking
    await Property.findByIdAndUpdate(booking.property._id, {
      $push: {
        'availability.blockedDates': {
          startDate: booking.checkInDate,
          endDate: booking.checkOutDate,
          reason: `Booking #${booking._id.toString().slice(-6)}`
        }
      }
    });

    // Send confirmation notifications
    await Notification.create({
      recipient: booking.user,
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your booking for "${booking.property.title}" is confirmed! Pack your bags.`,
      link: `/dashboard/user`
    });

    res.status(200).json({
      success: true,
      message: 'Booking and payment confirmed successfully!',
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's own bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('property', 'title location images pricing propertyType')
      .populate('host', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get owner's received bookings
// @route   GET /api/bookings/host-bookings
// @access  Private (Owner or Admin)
exports.getHostBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ host: req.user.id })
      .populate('property', 'title location images pricing')
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('property');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isGuest = booking.user.toString() === req.user.id;
    const isHost = booking.host.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user.id,
      reason: reason || 'Cancelled by user',
      cancelledAt: new Date(),
      refundAmount: booking.payment.paymentStatus === 'paid' ? booking.pricing.totalAmount : 0
    };
    if (booking.payment.paymentStatus === 'paid') {
      booking.payment.paymentStatus = 'refunded';
    }
    await booking.save();

    // Release the blocked dates from property calendar
    await Property.findByIdAndUpdate(booking.property._id, {
      $pull: {
        'availability.blockedDates': {
          startDate: booking.checkInDate,
          endDate: booking.checkOutDate
        }
      }
    });

    // Notify the other party
    const notifyRecipient = isGuest ? booking.host : booking.user;
    await Notification.create({
      recipient: notifyRecipient,
      sender: req.user.id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Booking for "${booking.property.title}" has been cancelled.`,
      link: isGuest ? '/dashboard/owner' : '/dashboard/user'
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Calendar slots released.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

