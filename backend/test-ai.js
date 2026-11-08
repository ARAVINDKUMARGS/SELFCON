require('dotenv').config();
const { connectDB } = require('./config/db');
const { discoverPropertiesWithAI } = require('./services/claudeService');

async function run() {
  await connectDB();
  const prompt = 'I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month.';
  console.log('Testing query:', prompt);
  const res = await discoverPropertiesWithAI(prompt);
  console.log('\n--- AI RESPONSE ---');
  console.log('Summary:', res.summary);
  console.log('Parsed Params:', res.parsedParameters);
  console.log('Total Results:', res.properties.length);
  res.properties.forEach((p, idx) => {
    console.log(`\n#${idx + 1}: ${p.title} (${p.location.city})`);
    console.log(`   Price: $${p.pricing.monthly}/mo (Nightly: $${p.pricing.nightly})`);
    console.log(`   AI Match Score: ${p.aiMatch.score}%`);
    console.log(`   AI Match Reason: ${p.aiMatch.reason}`);
  });
  process.exit(0);
}

run();

