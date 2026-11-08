const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Please provide an overall rating from 1 to 5'],
      min: 1,
      max: 5
    },
    categories: {
      cleanliness: { type: Number, default: 5, min: 1, max: 5 },
      accuracy: { type: Number, default: 5, min: 1, max: 5 },
      communication: { type: Number, default: 5, min: 1, max: 5 },
      location: { type: Number, default: 5, min: 1, max: 5 },
      value: { type: Number, default: 5, min: 1, max: 5 }
    },
    comment: {
      type: String,
      required: [true, 'Please write a review comment'],
      trim: true,
      maxlength: 1000
    },
    responseFromOwner: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

ReviewSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

