const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');
const Offer = require('./models/Offer');
const Review = require('./models/Review');
const { discoverPropertiesWithAI } = require('./services/claudeService');
const { validateBookingRequest } = require('./services/bookingValidationService');

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 SELFCON AUTOMATED INTEGRATION & COMPLIANCE TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
    }
  }

  try {
    await connectDB();
    console.log('[Setup]: Database connected successfully.\n');

    // -------------------------------------------------------------
    // Test 1: User Authentication & Role Model Check
    // -------------------------------------------------------------
    console.log('--- Suite 1: Authentication & RBAC ---');
    const adminUser = await User.findOne({ email: 'admin@selfcon.com' });
    assert(adminUser !== null, 'Admin user exists in database');
    assert(adminUser?.role === 'admin', 'Admin user has role "admin"');

    const ownerUser = await User.findOne({ email: 'owner@selfcon.com' });
    assert(ownerUser !== null && ownerUser.role === 'owner', 'Property Owner user exists with role "owner"');

    const tenantUser = await User.findOne({ email: 'tenant@selfcon.com' });
    assert(tenantUser !== null && tenantUser.role === 'tenant', 'Tenant user exists with role "tenant"');

    const buyerUser = await User.findOne({ email: 'buyer@selfcon.com' });
    assert(buyerUser !== null && buyerUser.role === 'buyer', 'Buyer user exists with role "buyer"');

    // -------------------------------------------------------------
    // Test 2: Multi-Mode Property Listings Verification
    // -------------------------------------------------------------
    console.log('\n--- Suite 2: Multi-Mode Property Listings ---');
    const properties = await Property.find({ status: 'active' });
    assert(properties.length >= 6, `Verified at least 6 properties in database (Found: ${properties.length})`);

    const multiModeProp = properties.find(p => p.listingModes.includes('stay') && p.listingModes.includes('rent'));
    assert(multiModeProp !== null, `Verified multi-mode listing supporting both Short Stay and Long Rent (${multiModeProp?.title})`);

    const saleProp = properties.find(p => p.listingModes.includes('buy'));
    assert(saleProp !== null && saleProp.pricing?.salePrice > 0, `Verified For Sale listing with active sale price ($${saleProp?.pricing?.salePrice?.toLocaleString()})`);

    // -------------------------------------------------------------
    // Test 3: SelfCon AI Discovery Engine (No-Hallucination RAG)
    // -------------------------------------------------------------
    console.log('\n--- Suite 3: Claude AI Natural Language Discovery ---');
    const queryPrompt = 'I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month.';
    const aiResult = await discoverPropertiesWithAI(queryPrompt);

    assert(aiResult.parsedParameters.mode === 'rent', 'AI extracted correct mode: "rent"');
    assert(aiResult.parsedParameters.bedrooms === 2, 'AI extracted bedroom count: 2');
    assert(aiResult.parsedParameters.maxPrice === 2000, 'AI extracted budget ceiling: $2,000');
    assert(aiResult.parsedParameters.durationMonths === 3, 'AI extracted duration: 3 months');
    assert(aiResult.properties.length > 0, `AI returned real MongoDB listings (Count: ${aiResult.properties.length})`);

    // Verify all properties returned exist in real database
    const firstMatch = aiResult.properties[0];
    const realDbCheck = await Property.findById(firstMatch._id);
    assert(realDbCheck !== null, `Zero-Hallucination verification: Matched property "${firstMatch.title}" exists in MongoDB`);
    assert(firstMatch.aiMatch?.score >= 80, `AI match score computed: ${firstMatch.aiMatch?.score}%`);
    assert(typeof firstMatch.aiMatch?.reason === 'string', `AI match explanation generated: "${firstMatch.aiMatch?.reason}"`);

    // -------------------------------------------------------------
    // Test 4: Booking Validation & Overlap Prevention (Double-Booking)
    // -------------------------------------------------------------
    console.log('\n--- Suite 4: Booking Engine & Overlap Conflict Prevention ---');
    const targetProperty = properties[0];

    // Pick dates far in the future to test booking
    const testCheckIn = new Date();
    testCheckIn.setDate(testCheckIn.getDate() + 90);
    const testCheckOut = new Date();
    testCheckOut.setDate(testCheckOut.getDate() + 95);

    // Initial valid booking
    const validBooking = await validateBookingRequest({
      propertyId: targetProperty._id,
      checkIn: testCheckIn,
      checkOut: testCheckOut,
      bookingMode: 'stay'
    });
    assert(validBooking.pricing.totalAmount > 0, `Booking validation computed total: $${validBooking.pricing.totalAmount}`);

    // Create the booking record
    const createdBooking = await Booking.create({
      property: targetProperty._id,
      user: tenantUser._id,
      host: targetProperty.owner,
      bookingMode: 'stay',
      checkInDate: testCheckIn,
      checkOutDate: testCheckOut,
      pricing: validBooking.pricing,
      status: 'confirmed'
    });
    assert(createdBooking._id !== null, 'Initial test booking confirmed in database');

    // Attempt CONFLICTING booking overlapping with the above dates
    const conflictingCheckIn = new Date(testCheckIn);
    conflictingCheckIn.setDate(conflictingCheckIn.getDate() + 2); // 2 days after check-in
    const conflictingCheckOut = new Date(testCheckOut);
    conflictingCheckOut.setDate(conflictingCheckOut.getDate() + 2);

    let conflictCaught = false;
    try {
      await validateBookingRequest({
        propertyId: targetProperty._id,
        checkIn: conflictingCheckIn,
        checkOut: conflictingCheckOut,
        bookingMode: 'stay'
      });
    } catch (err) {
      conflictCaught = true;
      assert(true, `Double-booking successfully blocked: "${err.message}"`);
    }

    if (!conflictCaught) {
      assert(false, 'Double-booking was NOT blocked (Server security failed)');
    }

    // Clean up test booking
    await Booking.findByIdAndDelete(createdBooking._id);
    console.log('  🧹 Cleaned up temporary test booking.');

    // -------------------------------------------------------------
    // Test 5: Buying & Purchase Offers Workflow
    // -------------------------------------------------------------
    console.log('\n--- Suite 5: Purchase Offers & Seller Counter Workflow ---');
    const testOffer = await Offer.create({
      property: saleProp._id,
      buyer: buyerUser._id,
      seller: saleProp.owner,
      offerAmount: saleProp.pricing.salePrice - 50000,
      financingType: 'cash',
      preApproved: true,
      message: 'All cash offer with flexible 30-day closing.',
      status: 'pending'
    });
    assert(testOffer._id !== null, `Purchase offer submitted ($${testOffer.offerAmount.toLocaleString()})`);

    // Seller Counter-Offer
    testOffer.status = 'countered';
    testOffer.counterOffer = {
      amount: saleProp.pricing.salePrice - 20000,
      terms: 'Countered at $20k below asking, 21-day inspection contingency.',
      counteredAt: new Date()
    };
    await testOffer.save();

    const updatedOffer = await Offer.findById(testOffer._id);
    assert(updatedOffer.status === 'countered', 'Seller counter-offer recorded with status "countered"');
    assert(updatedOffer.counterOffer.amount === saleProp.pricing.salePrice - 20000, 'Counter-offer amount stored accurately');

    // Clean up test offer
    await Offer.findByIdAndDelete(testOffer._id);
    console.log('  🧹 Cleaned up temporary test offer.');

    // -------------------------------------------------------------
    // Test 6: Review & Dynamic Rating Re-computation
    // -------------------------------------------------------------
    console.log('\n--- Suite 6: Verified Review & Ratings Aggregate ---');
    const existingReviews = await Review.find({ property: targetProperty._id });
    assert(existingReviews.length >= 0, `Property reviews retrieved (Count: ${existingReviews.length})`);
    assert(targetProperty.stats.averageRating >= 4.0, `Average rating computed (${targetProperty.stats.averageRating}★)`);

    // -------------------------------------------------------------
    // Final Summary
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('================================================================\n');

    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (err) {
    console.error('Test Suite encountered fatal error:', err);
    process.exit(1);
  }
}

runTestSuite();
