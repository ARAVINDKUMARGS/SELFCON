const Booking = require('../models/Booking');
const Property = require('../models/Property');

/**
 * Validate dates and calculate accurate pricing for short-term stay or long-term rent
 */
async function validateBookingRequest({ propertyId, checkIn, checkOut, bookingMode = 'stay' }) {
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  if (property.status !== 'active') {
    throw new Error(`Property is currently ${property.status} and unavailable for booking.`);
  }

  if (!property.listingModes.includes(bookingMode)) {
    throw new Error(`Property does not support '${bookingMode}' mode. Available modes: ${property.listingModes.join(', ')}`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new Error('Invalid dates provided');
  }

  if (checkInDate < today) {
    throw new Error('Check-in date cannot be in the past');
  }

  if (checkOutDate <= checkInDate) {
    throw new Error('Check-out date must be after check-in date');
  }

  // Calculate duration
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (bookingMode === 'stay') {
    if (property.availability?.minimumStayNights && diffNights < property.availability.minimumStayNights) {
      throw new Error(`Minimum stay for this property is ${property.availability.minimumStayNights} nights.`);
    }
  } else if (bookingMode === 'rent') {
    // Rent duration in months (minimum 30 days)
    if (diffNights < 30) {
      throw new Error('Long-term rental requires a minimum lease duration of at least 30 days.');
    }
  }

  // Check owner blocked dates
  if (property.availability?.blockedDates && property.availability.blockedDates.length > 0) {
    for (const blocked of property.availability.blockedDates) {
      const bStart = new Date(blocked.startDate);
      const bEnd = new Date(blocked.endDate);
      if (checkInDate < bEnd && checkOutDate > bStart) {
        throw new Error(`Property is unavailable from ${bStart.toLocaleDateString()} to ${bEnd.toLocaleDateString()} (${blocked.reason || 'Reserved'}).`);
      }
    }
  }

  // Check conflicting active bookings in database
  const conflictingBooking = await Booking.findOne({
    property: propertyId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate }
      }
    ]
  });

  if (conflictingBooking) {
    throw new Error('Property is already booked or reserved for these dates. Please choose different dates.');
  }

  // Calculate pricing breakdown
  let rate = 0;
  let unitsCount = 0;
  let subtotal = 0;
  const cleaningFee = property.pricing.cleaningFee || 0;
  const securityDeposit = property.pricing.securityDeposit || 0;

  if (bookingMode === 'stay') {
    rate = property.pricing.nightly || 100;
    unitsCount = diffNights;
    subtotal = rate * unitsCount;
  } else {
    // Rental mode (monthly calculation)
    rate = property.pricing.monthly || (property.pricing.nightly * 25);
    const months = Math.max(1, Math.round(diffNights / 30));
    unitsCount = months;
    subtotal = rate * unitsCount;
  }

  // Platform service fee (e.g. 10%)
  const serviceFee = Math.round(subtotal * 0.10);
  const totalAmount = subtotal + cleaningFee + serviceFee + securityDeposit;

  return {
    property,
    checkInDate,
    checkOutDate,
    unitsCount,
    bookingMode,
    pricing: {
      rate,
      unitsCount,
      subtotal,
      cleaningFee,
      serviceFee,
      securityDeposit,
      totalAmount,
      currency: property.pricing.currency || 'USD'
    }
  };
}

module.exports = {
  validateBookingRequest
};

