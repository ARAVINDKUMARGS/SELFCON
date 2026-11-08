const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingMode: {
      type: String,
      enum: ['stay', 'rent'],
      default: 'stay',
      required: true
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please provide check-in date']
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please provide check-out date']
    },
    guests: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0 },
      pets: { type: Number, default: 0 }
    },
    pricing: {
      rate: { type: Number, required: true }, // nightly or monthly rate
      unitsCount: { type: Number, required: true }, // nights or months
      subtotal: { type: Number, required: true },
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      securityDeposit: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'USD' }
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'pending'
    },
    payment: {
      provider: {
        type: String,
        enum: ['razorpay', 'stripe', 'test'],
        default: 'test'
      },
      orderId: String,
      paymentId: String,
      signature: String,
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
      },
      paidAt: Date
    },
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      cancelledAt: Date,
      refundAmount: { type: Number, default: 0 }
    },
    specialRequests: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

BookingSchema.index({ property: 1, checkInDate: 1, checkOutDate: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);

