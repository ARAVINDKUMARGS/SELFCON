const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUser,
  moderateProperty,
  getReports,
  resolveReport,
  getOwnerDashboard
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Owner dashboard route
router.get('/owner-dashboard', protect, authorize('owner', 'seller', 'admin'), getOwnerDashboard);

// Admin-only management routes
router.get('/stats', protect, authorize('admin'), getPlatformStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.put('/properties/:id/moderate', protect, authorize('admin'), moderateProperty);
router.get('/reports', protect, authorize('admin'), getReports);
router.put('/reports/:id/resolve', protect, authorize('admin'), resolveReport);

module.exports = router;

