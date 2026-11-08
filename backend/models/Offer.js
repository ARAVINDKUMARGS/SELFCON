const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offerAmount: {
      type: Number,
      required: [true, 'Please enter offer amount'],
      min: 1
    },
    financingType: {
      type: String,
      enum: ['cash', 'conventional_mortgage', 'fha', 'va', 'other'],
      default: 'cash'
    },
    preApproved: {
      type: Boolean,
      default: false
    },
    earnestMoneyDeposit: {
      type: Number,
      default: 0
    },
    proposedClosingDate: {
      type: Date
    },
    contingencies: [
      {
        type: String
      }
    ],
    message: {
      type: String,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'countered', 'withdrawn'],
      default: 'pending'
    },
    counterOffer: {
      amount: Number,
      closingDate: Date,
      terms: String,
      counteredAt: Date
    },
    scheduledVisit: {
      requestedDate: Date,
      timeSlot: String,
      notes: String,
      status: {
        type: String,
        enum: ['none', 'requested', 'confirmed', 'completed', 'cancelled'],
        default: 'none'
      }
    }
  },
  {
    timestamps: true
  }
);

OfferSchema.index({ property: 1, buyer: 1, seller: 1, status: 1 });

module.exports = mongoose.model('Offer', OfferSchema);

