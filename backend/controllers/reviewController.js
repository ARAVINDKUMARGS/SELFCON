const Review = require('../models/Review');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Get all reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review for a property
// @route   POST /api/reviews/property/:propertyId
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment, categories } = req.body;
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if user already reviewed
    const existing = await Review.findOne({
      property: req.params.propertyId,
      user: req.user.id
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this property' });
    }

    const review = await Review.create({
      property: req.params.propertyId,
      user: req.user.id,
      rating,
      comment,
      categories: categories || {}
    });

    // Recalculate average rating for property
    const allReviews = await Review.find({ property: req.params.propertyId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Property.findByIdAndUpdate(req.params.propertyId, {
      'stats.averageRating': Math.round(avg * 10) / 10,
      'stats.reviewsCount': allReviews.length
    });

    // Notify owner
    await Notification.create({
      recipient: property.owner,
      sender: req.user.id,
      type: 'review_received',
      title: 'New Review on Your Listing',
      message: `${req.user.name} rated your property "${property.title}" ${rating} stars.`,
      link: `/properties/${property._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Owner reply to a review
// @route   PUT /api/reviews/:id/reply
// @access  Private (Owner or Admin)
exports.replyToReview = async (req, res, next) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id).populate('property');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    review.responseFromOwner = response;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added to review',
      review
    });
  } catch (err) {
    next(err);
  }
};

