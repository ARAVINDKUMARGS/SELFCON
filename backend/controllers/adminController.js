const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Offer = require('../models/Offer');
const Report = require('../models/Report');

// @desc    Admin: Platform analytics and KPI overview
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      totalOffers,
      pendingReports,
      pendingProperties,
      confirmedBookings
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Offer.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'pending_approval' }),
      Booking.find({ status: 'confirmed' }).select('pricing.totalAmount')
    ]);

    const totalGMV = confirmedBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

    // Distribution by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Distribution by property mode
    const propertiesByMode = await Property.aggregate([
      { $unwind: '$listingModes' },
      { $group: { _id: '$listingModes', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalOffers,
        pendingReports,
        pendingProperties,
        totalGMV,
        usersByRole,
        propertiesByMode
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Get all users with search and filter
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Update user role or verification status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { role, verified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }), ...(verified !== undefined && { verified }) },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Moderate property (approve/reject/feature)
// @route   PUT /api/admin/properties/:id/moderate
// @access  Private (Admin)
exports.moderateProperty = async (req, res, next) => {
  try {
    const { status, isFeatured, isVerified } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;
    if (isVerified !== undefined) updates.isVerified = isVerified;

    const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.status(200).json({
      success: true,
      message: 'Property moderation updated successfully',
      property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Get all trust & safety fraud reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email avatar')
      .populate('property', 'title location images owner')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Resolve or dismiss fraud report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin)
exports.resolveReport = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolutionNotes,
        resolvedBy: req.user.id
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Report marked as ${status}`,
      report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Owner: Comprehensive Owner / Host Dashboard KPI & analytics
// @route   GET /api/admin/owner-dashboard
// @access  Private (Owner, Seller, Admin)
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const [properties, bookings, offers] = await Promise.all([
      Property.find({ owner: ownerId }).sort({ createdAt: -1 }),
      Booking.find({ host: ownerId }).populate('property', 'title images').populate('user', 'name avatar email').sort({ createdAt: -1 }),
      Offer.find({ seller: ownerId }).populate('property', 'title images').populate('buyer', 'name avatar email').sort({ createdAt: -1 })
    ]);

    const activeListings = properties.filter(p => p.status === 'active').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
    const totalViews = properties.reduce((sum, p) => sum + (p.stats?.viewsCount || 0), 0);

    res.status(200).json({
      success: true,
      metrics: {
        totalListings: properties.length,
        activeListings,
        pendingBookings,
        confirmedBookingsCount: confirmedBookings.length,
        totalEarnings,
        totalViews,
        totalOffers: offers.length
      },
      properties,
      recentBookings: bookings.slice(0, 10),
      recentOffers: offers.slice(0, 10)
    });
  } catch (err) {
    next(err);
  }
};

