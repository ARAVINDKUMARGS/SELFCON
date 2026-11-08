const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getUserFavorites,
  getUserDashboard,
  reportProperty
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/favorites/:propertyId', protect, toggleFavorite);
router.get('/favorites', protect, getUserFavorites);
router.get('/dashboard', protect, getUserDashboard);
router.post('/report', protect, reportProperty);

module.exports = router;

