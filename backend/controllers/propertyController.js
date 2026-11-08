const Property = require('../models/Property');
const Favorite = require('../models/Favorite');

// @desc    Get all properties with multi-mode unified filters and search
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const {
      mode, // 'stay', 'rent', 'buy'
      city,
      location,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      amenities,
      furnishing,
      isFeatured,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = { status: 'active' };

    // Mode filter (Stay, Rent, Buy)
    if (mode && ['stay', 'rent', 'buy'].includes(mode.toLowerCase())) {
      query.listingModes = mode.toLowerCase();
    }

    // Location / City search
    const locSearch = city || location;
    if (locSearch) {
      query.$or = [
        { 'location.city': { $regex: locSearch, $options: 'i' } },
        { 'location.state': { $regex: locSearch, $options: 'i' } },
        { 'location.address': { $regex: locSearch, $options: 'i' } }
      ];
    }

    // Property Type
    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType.toLowerCase();
    }

    // Bedrooms
    if (bedrooms && bedrooms !== 'any') {
      const bedNum = parseInt(bedrooms, 10);
      if (!isNaN(bedNum)) {
        query['specs.bedrooms'] = { $gte: bedNum };
      }
    }

    // Bathrooms
    if (bathrooms && bathrooms !== 'any') {
      const bathNum = parseInt(bathrooms, 10);
      if (!isNaN(bathNum)) {
        query['specs.bathrooms'] = { $gte: bathNum };
      }
    }

    // Furnishing
    if (furnishing && furnishing !== 'all') {
      query['specs.furnishing'] = furnishing;
    }

    // Featured only
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Pricing filter depending on active mode
    if (minPrice || maxPrice) {
      let priceField = 'pricing.nightly';
      if (mode === 'rent') priceField = 'pricing.monthly';
      if (mode === 'buy') priceField = 'pricing.salePrice';

      query[priceField] = {};
      if (minPrice) query[priceField].$gte = parseFloat(minPrice);
      if (maxPrice) query[priceField].$lte = parseFloat(maxPrice);
    }

    // Amenities filter
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : amenities.split(',').map(a => a.trim());
      if (amenityArray.length > 0) {
        query.amenities = { $all: amenityArray };
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      const priceField = mode === 'rent' ? 'pricing.monthly' : mode === 'buy' ? 'pricing.salePrice' : 'pricing.nightly';
      sortOption = { [priceField]: 1 };
    } else if (sort === 'price-desc') {
      const priceField = mode === 'rent' ? 'pricing.monthly' : mode === 'buy' ? 'pricing.salePrice' : 'pricing.nightly';
      sortOption = { [priceField]: -1 };
    } else if (sort === 'rating') {
      sortOption = { 'stats.averageRating': -1 };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('owner', 'name avatar role verified phone')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      properties
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name avatar role verified bio phone email createdAt');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment views count non-blockingly
    Property.findByIdAndUpdate(req.params.id, { $inc: { 'stats.viewsCount': 1 } }).exec();

    res.status(200).json({
      success: true,
      property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new property listing
// @route   POST /api/properties
// @access  Private (Owner, Seller, Admin)
exports.createProperty = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;

    if (!req.body.images || req.body.images.length === 0) {
      req.body.images = [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          isPrimary: true
        }
      ];
    }

    const hasPrimary = req.body.images.some(img => img.isPrimary);
    if (!hasPrimary && req.body.images.length > 0) {
      req.body.images[0].isPrimary = true;
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Property listed successfully!',
      property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner or Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this property.' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('owner', 'name avatar role verified');

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner or Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this property.' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured properties for homepage
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: 'active', isFeatured: true })
      .populate('owner', 'name avatar role verified')
      .limit(8);

    if (properties.length === 0) {
      const topProperties = await Property.find({ status: 'active' })
        .populate('owner', 'name avatar role verified')
        .sort({ 'stats.averageRating': -1 })
        .limit(8);

      return res.status(200).json({
        success: true,
        count: topProperties.length,
        properties: topProperties
      });
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get popular destinations with counts and imagery
// @route   GET /api/properties/destinations
// @access  Public
exports.getPopularDestinations = async (req, res, next) => {
  try {
    const destinations = [
      {
        city: 'Mumbai',
        tagline: 'Coastal Metropolis & High-Rise Luxury',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        state: 'Maharashtra',
        country: 'India'
      },
      {
        city: 'Goa',
        tagline: 'Beachfront Villas & Serene Getaways',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        state: 'Goa',
        country: 'India'
      },
      {
        city: 'Bangalore',
        tagline: 'Tech Hub Penthouses & Green Estates',
        image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        state: 'Karnataka',
        country: 'India'
      },
      {
        city: 'Dubai',
        tagline: 'Ultra-Luxury Architecture & Skyline Penthouses',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
        state: 'Dubai',
        country: 'UAE'
      },
      {
        city: 'New York',
        tagline: 'Iconic Manhattan Lofts & Brownstones',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
        state: 'NY',
        country: 'USA'
      },
      {
        city: 'London',
        tagline: 'Historic Townhouses & Contemporary Flats',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
        state: 'England',
        country: 'UK'
      }
    ];

    const withCounts = await Promise.all(
      destinations.map(async dest => {
        const count = await Property.countDocuments({
          'location.city': { $regex: dest.city, $options: 'i' },
          status: 'active'
        });
        return { ...dest, propertyCount: count };
      })
    );

    res.status(200).json({
      success: true,
      destinations: withCounts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Block or unblock dates in property calendar
// @route   POST /api/properties/:id/block-dates
// @access  Private (Owner or Admin)
exports.blockDates = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    property.availability.blockedDates.push({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || 'Owner Block'
    });

    await property.save();

    res.status(200).json({
      success: true,
      message: 'Dates successfully blocked on property calendar',
      blockedDates: property.availability.blockedDates
    });
  } catch (err) {
    next(err);
  }
};

