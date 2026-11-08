const Anthropic = require('@anthropic-ai/sdk');
const Property = require('../models/Property');
const User = require('../models/User');

// Initialize Anthropic client if API key is present
let anthropicClient = null;
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
  try {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  } catch (e) {
    console.warn('[Claude Service]: Error initializing Anthropic client:', e.message);
  }
}

/**
 * Intelligent deterministic fallback NLP extractor when Claude API key is absent or offline.
 * Extracts intent, budget, bedrooms, location, mode, and amenities from natural language.
 */
function extractQueryEntitiesRuleBased(queryText) {
  const text = queryText.toLowerCase();

  // Mode detection
  let mode = 'any';
  let durationMonths = null;
  if (/stay|night|weekend|holiday|vacation|short[- ]term/.test(text)) {
    mode = 'stay';
  } else if (/rent|month|months|lease|long[- ]term|tenant/.test(text)) {
    mode = 'rent';
  } else if (/buy|purchase|sale|own|invest|for sale/.test(text)) {
    mode = 'buy';
  }

  // Duration extraction
  const monthMatch = text.match(/(\d+)\s*(?:month|months|mo)/i) || text.match(/(three|six|twelve|two|four|five|one)\s*(?:month|months|mo)/i);
  if (monthMatch) {
    const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, twelve: 12 };
    durationMonths = parseInt(monthMatch[1], 10) || wordMap[monthMatch[1].toLowerCase()] || 3;
    if (mode === 'any') mode = 'rent';
  }

  // Budget extraction ($2,000, 2000 usd, under 2000, 2k, $150/night)
  let maxPrice = null;
  let minPrice = null;

  const priceMatches = text.match(/(?:under|below|less than|up to|max(?:imum)?)\s*(?:\$|usd|inr|₹)?\s*([0-9,]+)\s*(k)?/i) ||
                       text.match(/(?:\$|usd|inr|₹)\s*([0-9,]+)\s*(k)?/i);

  if (priceMatches && priceMatches[1]) {
    let rawNum = parseFloat(priceMatches[1].replace(/,/g, ''));
    if (priceMatches[2] && priceMatches[2].toLowerCase() === 'k') {
      rawNum *= 1000;
    }
    maxPrice = rawNum;
  }

  // Bedrooms extraction (2 bedroom, 2-bed, 2-bedroom, 2bhk, 3 beds)
  let bedrooms = null;
  const bedMatch = text.match(/(\d+)\s*[- ]?\s*(?:bed|bedroom|bedrooms|bhk)/i);
  if (bedMatch) {
    bedrooms = parseInt(bedMatch[1], 10);
  }

  // Bathrooms extraction
  let bathrooms = null;
  const bathMatch = text.match(/(\d+)\s*[- ]?\s*(?:bath|bathroom|bathrooms)/i);
  if (bathMatch) {
    bathrooms = parseInt(bathMatch[1], 10);
  }

  // Known location keywords
  const cities = ['mumbai', 'goa', 'bangalore', 'bengaluru', 'delhi', 'pune', 'hyderabad', 'chennai', 'dubai', 'new york', 'london', 'san francisco'];
  let location = null;
  for (const c of cities) {
    if (text.includes(c)) {
      location = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Property types
  const types = ['apartment', 'villa', 'studio', 'penthouse', 'house', 'townhouse'];
  let propertyType = null;
  for (const t of types) {
    if (text.includes(t)) {
      propertyType = t;
      break;
    }
  }

  // Amenities & Lifestyle extraction
  const amenityMap = [
    { key: 'High-Speed WiFi', patterns: ['wifi', 'internet', 'high-speed internet', 'fast internet', 'fiber'] },
    { key: 'Swimming Pool', patterns: ['pool', 'swimming pool', 'infinity pool'] },
    { key: 'Gym / Fitness Center', patterns: ['gym', 'fitness', 'workout'] },
    { key: 'Air Conditioning', patterns: ['ac', 'air conditioning', 'air conditioned', 'climate control'] },
    { key: 'Dedicated Workspace', patterns: ['workspace', 'desk', 'work from home', 'wfh', 'study'] },
    { key: 'Pet Friendly', patterns: ['pet', 'pets', 'dog', 'cat', 'pet friendly'] },
    { key: 'Balcony / Patio', patterns: ['balcony', 'patio', 'terrace', 'deck', 'verandah'] },
    { key: 'Security 24/7', patterns: ['security', 'gated', 'guarded', 'safe', 'doorman'] },
    { key: 'Free Parking', patterns: ['parking', 'garage'] }
  ];

  const requiredAmenities = [];
  amenityMap.forEach(({ key, patterns }) => {
    if (patterns.some(p => text.includes(p))) {
      requiredAmenities.push(key);
    }
  });

  const lifestyle = [];
  if (text.includes('quiet') || text.includes('peaceful') || text.includes('calm')) lifestyle.push('Quiet & Peaceful');
  if (text.includes('beach') || text.includes('sea') || text.includes('ocean')) lifestyle.push('Near Beach / Water View');
  if (text.includes('luxury') || text.includes('luxurious') || text.includes('prime')) lifestyle.push('Luxury Living');

  return {
    mode,
    maxPrice,
    minPrice,
    bedrooms,
    bathrooms,
    location,
    propertyType,
    requiredAmenities,
    lifestylePreferences: lifestyle,
    durationMonths
  };
}

/**
 * Extract structured search parameters from user prompt via Claude or rule-based parser
 */
async function parseUserPrompt(promptText) {
  if (anthropicClient) {
    try {
      const systemPrompt = `You are the core AI parser for SELFCON Real Estate Marketplace.
Your job is to analyze the user's natural language property query and extract structured JSON search parameters.
Return ONLY valid JSON matching this schema:
{
  "mode": "stay" | "rent" | "buy" | "any",
  "maxPrice": number or null,
  "minPrice": number or null,
  "location": string or null,
  "bedrooms": number or null,
  "bathrooms": number or null,
  "propertyType": string or null,
  "requiredAmenities": string[],
  "lifestylePreferences": string[],
  "durationMonths": number or null,
  "clarifyingQuestion": string or null
}
Never include markdown backticks or commentary in your response, only raw JSON.`;

      const response = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{ role: 'user', content: promptText }]
      });

      const raw = response.content[0].text.trim();
      const cleanJson = raw.replace(/^```json/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[Claude Parse Fallback]:', err.message);
    }
  }

  // Deterministic NLP fallback
  return extractQueryEntitiesRuleBased(promptText);
}

/**
 * Execute real database search on MongoDB using extracted parameters
 */
async function searchMongoDBListings(params) {
  const andClauses = [{ status: 'active' }];

  // Mode filter
  if (params.mode && params.mode !== 'any') {
    andClauses.push({ listingModes: params.mode });
  }

  // Location filter
  if (params.location) {
    andClauses.push({
      $or: [
        { 'location.city': { $regex: params.location, $options: 'i' } },
        { 'location.state': { $regex: params.location, $options: 'i' } },
        { 'location.address': { $regex: params.location, $options: 'i' } }
      ]
    });
  }

  // Property type
  if (params.propertyType) {
    andClauses.push({ propertyType: params.propertyType.toLowerCase() });
  }

  // Bedrooms
  if (params.bedrooms) {
    andClauses.push({ 'specs.bedrooms': { $gte: params.bedrooms } });
  }

  // Price constraints based on mode
  if (params.maxPrice) {
    if (params.mode === 'stay') {
      andClauses.push({ 'pricing.nightly': { $lte: params.maxPrice, $gt: 0 } });
    } else if (params.mode === 'buy') {
      andClauses.push({ 'pricing.salePrice': { $lte: params.maxPrice, $gt: 0 } });
    } else if (params.mode === 'rent') {
      andClauses.push({ 'pricing.monthly': { $lte: params.maxPrice, $gt: 0 } });
    } else {
      // any mode
      andClauses.push({
        $or: [
          { 'pricing.monthly': { $lte: params.maxPrice, $gt: 0 } },
          { 'pricing.nightly': { $lte: params.maxPrice, $gt: 0 } }
        ]
      });
    }
  }

  // Amenities
  if (params.requiredAmenities && params.requiredAmenities.length > 0) {
    andClauses.push({ amenities: { $all: params.requiredAmenities } });
  }

  const query = { $and: andClauses };
  let results = await Property.find(query).populate('owner', 'name avatar role verified').limit(12);

  // If strict query yields 0 results, widen criteria to find close alternatives (never return empty if properties exist)
  let isAlternative = false;
  if (results.length === 0) {
    isAlternative = true;
    const relaxedQuery = { status: 'active' };
    if (params.mode && params.mode !== 'any') {
      relaxedQuery.listingModes = params.mode;
    }
    // Try matching without strict amenity or price cap
    results = await Property.find(relaxedQuery)
      .populate('owner', 'name avatar role verified')
      .sort({ 'stats.averageRating': -1 })
      .limit(6);

    // If still 0, get top rated properties
    if (results.length === 0) {
      results = await Property.find({ status: 'active' })
        .populate('owner', 'name avatar role verified')
        .sort({ 'stats.averageRating': -1 })
        .limit(6);
    }
  }

  return { results, isAlternative };
}

/**
 * Pass actual MongoDB results to Claude (or intelligent reasoning engine)
 * to rank, calculate match score, and generate verified reasoning.
 */
async function generateClaudeExplanations(userPrompt, parsedParams, rawProperties, isAlternative) {
  if (rawProperties.length === 0) {
    return {
      summary: "I searched our real estate listings database, but no matching properties are currently available for this specific query. Try adjusting your budget or selecting a different location.",
      recommendations: [],
      clarifyingQuestions: ["Would you like to explore listings in neighboring areas?", "Would you consider adjusting your monthly budget?"]
    };
  }

  // If Claude client is available, get custom generative ranking and personalized explanations
  if (anthropicClient) {
    try {
      const listingsContext = rawProperties.map(p => ({
        id: p._id.toString(),
        title: p.title,
        city: p.location.city,
        type: p.propertyType,
        modes: p.listingModes,
        bedrooms: p.specs.bedrooms,
        bathrooms: p.specs.bathrooms,
        squareFeet: p.specs.squareFeet,
        pricing: p.pricing,
        amenities: p.amenities
      }));

      const systemPrompt = `You are SELFCON AI, an elite real estate discovery assistant.
You have been provided with REAL listings from MongoDB.
CRITICAL MANDATE:
- NEVER invent property titles, locations, prices, amenities, or IDs.
- You may ONLY recommend and explain the properties provided in the data.
- Analyze how each property fits the user's prompt: "${userPrompt}".
- Output valid JSON:
{
  "summary": "Engaging conversational overview of the findings (2-3 sentences)",
  "rankedProperties": [
    {
      "propertyId": "exact string ID from listings",
      "matchScore": number between 75 and 99,
      "whyItMatches": "Specific explanation highlighting exact features matching the user query (e.g. WiFi, gym, budget)"
    }
  ],
  "clarifyingQuestions": ["1-2 helpful questions to refine further if needed"]
}`;

      const response = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: 'user', content: JSON.stringify(listingsContext) }]
      });

      const raw = response.content[0].text.trim();
      const cleanJson = raw.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      const propertyMap = new Map(rawProperties.map(p => [p._id.toString(), p]));

      const ranked = parsed.rankedProperties
        .filter(item => propertyMap.has(item.propertyId))
        .map(item => {
          const prop = propertyMap.get(item.propertyId).toObject();
          prop.aiMatch = {
            score: item.matchScore,
            reason: item.whyItMatches,
            isAlternative
          };
          return prop;
        });

      return {
        summary: parsed.summary,
        recommendations: ranked.length > 0 ? ranked : rawProperties,
        clarifyingQuestions: parsed.clarifyingQuestions || []
      };
    } catch (claudeErr) {
      console.warn('[Claude Ranking Fallback]:', claudeErr.message);
    }
  }

  // Deterministic Reasoning Engine (guarantees 100% verified real database facts)
  const ranked = rawProperties.map(prop => {
    let score = 85;
    const reasons = [];

    // Check bedrooms
    if (parsedParams.bedrooms && prop.specs.bedrooms >= parsedParams.bedrooms) {
      score += 5;
      reasons.push(`${prop.specs.bedrooms} bedrooms match your requirement`);
    }

    // Check location
    if (parsedParams.location && prop.location.city.toLowerCase() === parsedParams.location.toLowerCase()) {
      score += 5;
      reasons.push(`Located in ${prop.location.city}`);
    }

    // Check amenities
    const matchingAmenities = [];
    (parsedParams.requiredAmenities || []).forEach(reqAmenity => {
      if (prop.amenities.includes(reqAmenity)) {
        matchingAmenities.push(reqAmenity);
      }
    });

    if (matchingAmenities.length > 0) {
      score += 4;
      reasons.push(`Equipped with ${matchingAmenities.join(', ')}`);
    }

    // Check price
    if (parsedParams.maxPrice) {
      if (parsedParams.mode === 'stay' && prop.pricing.nightly <= parsedParams.maxPrice) {
        reasons.push(`Nightly rate of $${prop.pricing.nightly} is within your $${parsedParams.maxPrice} budget`);
      } else if (prop.pricing.monthly && prop.pricing.monthly <= parsedParams.maxPrice) {
        reasons.push(`Monthly rent of $${prop.pricing.monthly} fits your $${parsedParams.maxPrice}/mo limit`);
      }
    }

    if (reasons.length === 0) {
      reasons.push(`Verified ${prop.propertyType} with high customer satisfaction (${prop.stats.averageRating}★)`);
    }

    const propObj = prop.toObject ? prop.toObject() : prop;
    propObj.aiMatch = {
      score: Math.min(score, 98),
      reason: isAlternative
        ? `Closest verified alternative: ${reasons.join('. ')}.`
        : reasons.join('. ') + '.',
      isAlternative
    };
    return propObj;
  });

  // Sort by AI score descending
  ranked.sort((a, b) => b.aiMatch.score - a.aiMatch.score);

  const summary = isAlternative
    ? `We couldn't find an exact 100% match for all criteria, but here are the top verified properties in our database that closely fit your preferences.`
    : `I found ${ranked.length} verified listings in our database matching your criteria. Here are the top recommendations ranked for your stay:`;

  return {
    summary,
    recommendations: ranked,
    clarifyingQuestions: [
      "Would you prefer a specific move-in or check-in date?",
      "Do you require parking or specific building amenities like an elevator?"
    ]
  };
}

/**
 * Main entry point for conversational property discovery
 */
async function discoverPropertiesWithAI(userPrompt) {
  // Step 1: Extract structured intent & parameters
  const parsedParams = await parseUserPrompt(userPrompt);

  // Step 2: Query actual MongoDB collection
  const { results, isAlternative } = await searchMongoDBListings(parsedParams);

  // Step 3: Rank & generate verified explanations
  const aiResponse = await generateClaudeExplanations(userPrompt, parsedParams, results, isAlternative);

  return {
    userPrompt,
    parsedParameters: parsedParams,
    isAlternative,
    summary: aiResponse.summary,
    properties: aiResponse.recommendations,
    clarifyingQuestions: aiResponse.clarifyingQuestions
  };
}

module.exports = {
  discoverPropertiesWithAI,
  parseUserPrompt,
  searchMongoDBListings
};
