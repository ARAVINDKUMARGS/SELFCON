const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters']
    },
    slug: {
      type: String,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Please add a detailed description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    listingModes: {
      type: [String],
      enum: ['stay', 'rent', 'buy'],
      default: ['stay'],
      required: true,
      validate: [val => val.length > 0, 'Property must have at least one listing mode']
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'villa', 'studio', 'penthouse', 'house', 'townhouse', 'commercial'],
      default: 'apartment',
      required: true
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      zipCode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    },
    specs: {
      bedrooms: { type: Number, required: true, min: 0 },
      bathrooms: { type: Number, required: true, min: 1 },
      squareFeet: { type: Number, required: true, min: 50 },
      maxGuests: { type: Number, default: 2, min: 1 },
      furnishing: {
        type: String,
        enum: ['furnished', 'semi-furnished', 'unfurnished'],
        default: 'furnished'
      },
      yearBuilt: { type: Number },
      parkingSpaces: { type: Number, default: 1 }
    },
    pricing: {
      nightly: { type: Number, default: 0 }, // For short-term stays
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }, // For long-term rental
      salePrice: { type: Number, default: 0 }, // For purchase
      cleaningFee: { type: Number, default: 0 },
      securityDeposit: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' }
    },
    amenities: {
      type: [String],
      default: []
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'under_contract', 'sold', 'rented', 'inactive'],
      default: 'active'
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    availability: {
      availableFrom: { type: Date, default: Date.now },
      minimumStayNights: { type: Number, default: 1 },
      blockedDates: [
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          reason: { type: String, default: 'Booked / Owner Reserved' }
        }
      ]
    },
    stats: {
      viewsCount: { type: Number, default: 0 },
      favoritesCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 4.8 },
      reviewsCount: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for rapid search performance
PropertySchema.index({ 'location.city': 'text', title: 'text', description: 'text' });
PropertySchema.index({ 'location.city': 1, listingModes: 1, 'pricing.nightly': 1, 'pricing.monthly': 1, 'pricing.salePrice': 1 });
PropertySchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });

module.exports = mongoose.model('Property', PropertySchema);

