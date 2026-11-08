const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getPopularDestinations,
  blockDates
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/destinations', getPopularDestinations);
router.get('/:id', getPropertyById);

router.post('/', protect, authorize('owner', 'seller', 'admin'), createProperty);
router.put('/:id', protect, authorize('owner', 'seller', 'admin'), updateProperty);
router.delete('/:id', protect, authorize('owner', 'seller', 'admin'), deleteProperty);
router.post('/:id/block-dates', protect, authorize('owner', 'seller', 'admin'), blockDates);

module.exports = router;

