const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Booking = require('../models/Booking');
const Offer = require('../models/Offer');
const Report = require('../models/Report');
const Property = require('../models/Property');

// @desc    Toggle add/remove favorite property
// @route   POST /api/users/favorites/:propertyId
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const existing = await Favorite.findOne({ user: req.user.id, property: propertyId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      await User.findByIdAndUpdate(req.user.id, { $pull: { savedProperties: propertyId } });
      await Property.findByIdAndUpdate(propertyId, { $inc: { 'stats.favoritesCount': -1 } });

      return res.status(200).json({
        success: true,
        isFavorited: false,
        message: 'Removed from favorites'
      });
    }

    await Favorite.create({ user: req.user.id, property: propertyId });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedProperties: propertyId } });
    await Property.findByIdAndUpdate(propertyId, { $inc: { 'stats.favoritesCount': 1 } });

    res.status(200).json({
      success: true,
      isFavorited: true,
      message: 'Added to favorites'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's favorites
// @route   GET /api/users/favorites
// @access  Private
exports.getUserFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'property',
        populate: { path: 'owner', select: 'name avatar verified' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites: favorites.filter(f => f.property !== null).map(f => f.property)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user dashboard aggregated metrics
// @route   GET /api/users/dashboard
// @access  Private
exports.getUserDashboard = async (req, res, next) => {
  try {
    const [bookings, offers, favorites, userDoc] = await Promise.all([
      Booking.find({ user: req.user.id })
        .populate('property', 'title location images pricing propertyType')
        .sort({ createdAt: -1 }),
      Offer.find({ buyer: req.user.id })
        .populate('property', 'title location images pricing')
        .sort({ createdAt: -1 }),
      Favorite.find({ user: req.user.id })
        .populate('property', 'title location images pricing stats')
        .sort({ createdAt: -1 }),
      User.findById(req.user.id).select('recentSearches')
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => b.status === 'confirmed').length,
        totalOffers: offers.length,
        savedPropertiesCount: favorites.length,
        recentSearches: userDoc?.recentSearches || [],
        bookings,
        offers,
        favorites: favorites.filter(f => f.property !== null).map(f => f.property)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit fraud or violation report for a property
// @route   POST /api/users/report
// @access  Private
exports.reportProperty = async (req, res, next) => {
  try {
    const { propertyId, reason, details } = req.body;

    const report = await Report.create({
      reporter: req.user.id,
      property: propertyId,
      reason,
      details
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our trust & safety moderation team will investigate.',
      report
    });
  } catch (err) {
    next(err);
  }
};

