const crypto = require('crypto');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Razorpay Webhook Handler
// @route   POST /api/webhooks/razorpay
// @access  Public (Signature Verified)
exports.handleRazorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (secret && signature) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const booking = await Booking.findOne({ 'payment.orderId': orderId }).populate('property');
        if (booking && booking.status === 'pending') {
          booking.status = 'confirmed';
          booking.payment.paymentStatus = 'paid';
          booking.payment.paymentId = paymentEntity.id;
          booking.payment.paidAt = new Date();
          await booking.save();

          // Lock calendar dates
          await Property.findByIdAndUpdate(booking.property._id, {
            $push: {
              'availability.blockedDates': {
                startDate: booking.checkInDate,
                endDate: booking.checkOutDate,
                reason: `Booking #${booking._id.toString().slice(-6)}`
              }
            }
          });

          // Send notification
          await Notification.create({
            recipient: booking.user,
            type: 'booking_confirmed',
            title: 'Payment Successful!',
            message: `Your booking for "${booking.property.title}" has been verified and confirmed.`,
            link: '/dashboard/user'
          });
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/webhooks/stripe
// @access  Public (Signature Verified)
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const event = req.body;

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.id;

      const booking = await Booking.findOne({ 'payment.orderId': orderId }).populate('property');
      if (booking && booking.status === 'pending') {
        booking.status = 'confirmed';
        booking.payment.paymentStatus = 'paid';
        booking.payment.paymentId = paymentIntent.id;
        booking.payment.paidAt = new Date();
        await booking.save();

        await Property.findByIdAndUpdate(booking.property._id, {
          $push: {
            'availability.blockedDates': {
              startDate: booking.checkInDate,
              endDate: booking.checkOutDate,
              reason: `Booking #${booking._id.toString().slice(-6)}`
            }
          }
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook Error]:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

