require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

async function inspectDatabase() {
  console.log('====================================================');
  console.log('📊 SELFCON DATABASE INSPECTION & METRICS REPORT');
  console.log('====================================================\n');

  await connectDB();

  const db = mongoose.connection.db;
  console.log(`Database Name: ${mongoose.connection.name}`);
  console.log(`Host:          ${mongoose.connection.host}:${mongoose.connection.port || 27017}\n`);

  const collections = await db.listCollections().toArray();
  console.log('--- Collections & Document Counts ---');

  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    const indexes = await db.collection(col.name).indexes();
    const indexNames = indexes.map(i => Object.keys(i.key).join('+')).join(', ');
    console.log(` • ${col.name.padEnd(16)} : ${count.toString().padStart(3)} documents  [Indexes: ${indexNames}]`);
  }

  // User breakdown
  console.log('\n--- Users Breakdown by Role ---');
  const userCol = db.collection('users');
  const userRoles = await userCol.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 }, names: { $push: '$name' } } }
  ]).toArray();

  userRoles.forEach(r => {
    console.log(` • ${r._id.padEnd(8)} : ${r.count} users (${r.names.join(', ')})`);
  });

  // Property breakdown
  console.log('\n--- Properties Breakdown by Mode & Location ---');
  const propCol = db.collection('properties');
  const props = await propCol.find({}).project({ title: 1, listingModes: 1, 'location.city': 1, pricing: 1 }).toArray();

  props.forEach((p, idx) => {
    const modes = (p.listingModes || []).join('/');
    const city = p.location?.city || 'Unknown';
    const prices = [];
    if (p.pricing?.nightly > 0) prices.push(`$${p.pricing.nightly}/nt`);
    if (p.pricing?.monthly > 0) prices.push(`$${p.pricing.monthly}/mo`);
    if (p.pricing?.salePrice > 0) prices.push(`$${p.pricing.salePrice.toLocaleString()} sale`);
    console.log(` #${idx + 1} ${p.title.padEnd(42)} [${city}] -> [${modes}] (${prices.join(', ')})`);
  });

  // Booking & Offers
  const bookingCount = await db.collection('bookings').countDocuments();
  const offerCount = await db.collection('offers').countDocuments();
  const reviewCount = await db.collection('reviews').countDocuments();

  console.log('\n--- Activity Totals ---');
  console.log(` • Confirmed/Pending Bookings : ${bookingCount}`);
  console.log(` • Active Purchase Offers    : ${offerCount}`);
  console.log(` • Verified Reviews Posted   : ${reviewCount}`);

  console.log('\n====================================================\n');
  process.exit(0);
}

inspectDatabase().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});

