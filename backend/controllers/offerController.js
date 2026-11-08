const Offer = require('../models/Offer');
const Property = require('../models/Property');
const Notification = require('../models/Notification');

// @desc    Submit purchase offer or visit schedule for a property
// @route   POST /api/offers
// @access  Private (Buyer, Tenant, Guest, or Admin)
exports.submitOffer = async (req, res, next) => {
  try {
    const {
      propertyId,
      offerAmount,
      financingType,
      preApproved,
      earnestMoneyDeposit,
      proposedClosingDate,
      contingencies,
      message,
      scheduledVisit
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot make an offer on your own property.' });
    }

    const offer = await Offer.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.owner,
      offerAmount: offerAmount || property.pricing.salePrice || 0,
      financingType: financingType || 'cash',
      preApproved: preApproved || false,
      earnestMoneyDeposit: earnestMoneyDeposit || 0,
      proposedClosingDate: proposedClosingDate || null,
      contingencies: contingencies || [],
      message: message || '',
      scheduledVisit: scheduledVisit || { status: 'none' }
    });

    // Notify seller
    await Notification.create({
      recipient: property.owner,
      sender: req.user.id,
      type: 'offer_received',
      title: 'New Offer Received!',
      message: `${req.user.name} submitted an offer of $${offer.offerAmount.toLocaleString()} on "${property.title}".`,
      link: `/dashboard/owner`
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully to the seller.',
      offer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get offers submitted by current user (Buyer)
// @route   GET /api/offers/my-offers
// @access  Private
exports.getMyOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ buyer: req.user.id })
      .populate('property', 'title location images pricing propertyType')
      .populate('seller', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      offers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get offers received by seller for their properties
// @route   GET /api/offers/seller-offers
// @access  Private (Owner, Seller, Admin)
exports.getSellerOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ seller: req.user.id })
      .populate('property', 'title location images pricing')
      .populate('buyer', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      offers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seller response: Accept, Reject, or Counter-Offer
// @route   PUT /api/offers/:id/respond
// @access  Private (Seller or Admin)
exports.respondToOffer = async (req, res, next) => {
  try {
    const { action, counterAmount, counterTerms, counterClosingDate } = req.body;
    const offer = await Offer.findById(req.params.id).populate('property');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (action === 'accept') {
      offer.status = 'accepted';
      // Mark property under contract
      await Property.findByIdAndUpdate(offer.property._id, { status: 'under_contract' });
    } else if (action === 'reject') {
      offer.status = 'rejected';
    } else if (action === 'counter') {
      offer.status = 'countered';
      offer.counterOffer = {
        amount: counterAmount,
        terms: counterTerms,
        closingDate: counterClosingDate ? new Date(counterClosingDate) : null,
        counteredAt: new Date()
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be accept, reject, or counter.' });
    }

    await offer.save();

    // Notify buyer
    const typeMap = {
      accept: 'offer_accepted',
      reject: 'offer_rejected',
      counter: 'offer_countered'
    };

    await Notification.create({
      recipient: offer.buyer,
      sender: req.user.id,
      type: typeMap[action],
      title: `Offer ${action.charAt(0).toUpperCase() + action.slice(1)}ed!`,
      message: `The seller has ${action}ed your offer on "${offer.property.title}".`,
      link: `/dashboard/user`
    });

    res.status(200).json({
      success: true,
      message: `Offer ${action}ed successfully`,
      offer
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Schedule or update a physical property visit
// @route   POST /api/offers/schedule-visit
// @access  Private
exports.scheduleVisit = async (req, res, next) => {
  try {
    const { propertyId, requestedDate, timeSlot, notes } = req.body;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const offer = await Offer.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.owner,
      offerAmount: property.pricing.salePrice || 0,
      status: 'pending',
      scheduledVisit: {
        requestedDate: new Date(requestedDate),
        timeSlot: timeSlot || '10:00 AM - 11:00 AM',
        notes: notes || '',
        status: 'requested'
      }
    });

    await Notification.create({
      recipient: property.owner,
      sender: req.user.id,
      type: 'visit_scheduled',
      title: 'Property Tour Requested',
      message: `${req.user.name} requested an in-person tour for "${property.title}" on ${new Date(requestedDate).toLocaleDateString()} (${timeSlot}).`,
      link: `/dashboard/owner`
    });

    res.status(201).json({
      success: true,
      message: 'Property visit tour scheduled with the owner.',
      offer
    });
  } catch (err) {
    next(err);
  }
};

