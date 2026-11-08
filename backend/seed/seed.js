const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Offer = require('../models/Offer');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { connectDB } = require('../config/db');

const seedDatabase = async () => {
  try {
    console.log('[Seeding]: Connecting to database...');
    await connectDB();

    console.log('[Seeding]: Clearing all 10 collections...');
    await User.deleteMany();
    await Property.deleteMany();
    await Booking.deleteMany();
    await Offer.deleteMany();
    await Review.deleteMany();
    await Favorite.deleteMany();
    await Notification.deleteMany();
    await Report.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    console.log('[Seeding]: 1. Creating Users for all roles...');
    const users = await User.create([
      {
        name: 'Alexander Wright',
        email: 'admin@selfcon.com',
        password: 'password123',
        role: 'admin',
        phone: '+1 555-0199',
        bio: 'SelfCon Lead Operations & Platform Architect.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Priya Sharma',
        email: 'owner@selfcon.com',
        password: 'password123',
        role: 'owner',
        phone: '+91 98201 12345',
        bio: 'Superhost & Boutique Real Estate developer across Goa, Mumbai, and Bangalore.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Vikram Mehta',
        email: 'seller@selfcon.com',
        password: 'password123',
        role: 'seller',
        phone: '+91 98112 54321',
        bio: 'Luxury real estate advisor and exclusive property portfolio manager.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Sarah Jenkins',
        email: 'tenant@selfcon.com',
        password: 'password123',
        role: 'tenant',
        phone: '+1 415-555-2671',
        bio: 'Senior Software Engineer working remotely. Seeking quiet, high-speed connected living spaces.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'David Chen',
        email: 'buyer@selfcon.com',
        password: 'password123',
        role: 'buyer',
        phone: '+1 212-555-8392',
        bio: 'Private investor looking for high-yield architectural residential properties.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Anya Kapoor',
        email: 'guest@selfcon.com',
        password: 'password123',
        role: 'guest',
        phone: '+91 98330 99887',
        bio: 'Architectural photographer & short-stay explorer.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Elena Rostova',
        email: 'elena@selfcon.com',
        password: 'password123',
        role: 'owner',
        phone: '+33 612 345 678',
        bio: 'Interior Designer & European luxury holiday home curator.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@selfcon.com',
        password: 'password123',
        role: 'tenant',
        phone: '+1 312-555-7788',
        bio: 'FinTech Managing Director relocating between New York, Dubai, and Mumbai.',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
      }
    ]);

    const [adminUser, ownerUser, sellerUser, tenantUser, buyerUser, guestUser, elenaUser, marcusUser] = users;

    console.log('[Seeding]: 2. Creating 12 Multi-Mode Properties...');
    const properties = await Property.create([
      {
        title: 'Azure Horizon Oceanfront Villa',
        slug: 'azure-horizon-oceanfront-villa',
        description: 'Perched directly above the Arabian Sea in North Goa, Azure Horizon is an architectural masterpiece featuring uninterrupted ocean views, a heated infinity pool, private beach access, and floor-to-ceiling glass. Includes high-speed 500Mbps fiber internet, dedicated executive workspace, private chef service on demand, and 24/7 security.',
        owner: ownerUser._id,
        listingModes: ['stay', 'rent', 'buy'],
        propertyType: 'villa',
        location: {
          address: '14 Cliffside Road, Anjuna',
          city: 'Goa',
          state: 'Goa',
          country: 'India',
          zipCode: '403509',
          coordinates: { lat: 15.5798, lng: 73.7423 }
        },
        specs: {
          bedrooms: 3,
          bathrooms: 4,
          squareFeet: 3800,
          maxGuests: 6,
          furnishing: 'furnished',
          yearBuilt: 2023,
          parkingSpaces: 2
        },
        pricing: {
          nightly: 320,
          weekly: 1900,
          monthly: 6200,
          salePrice: 1450000,
          cleaningFee: 60,
          securityDeposit: 300,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Swimming Pool',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Pet Friendly',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: true,
        isVerified: true,
        stats: {
          viewsCount: 1420,
          favoritesCount: 89,
          averageRating: 4.95,
          reviewsCount: 14
        }
      },
      {
        title: 'Skyline Haven High-Rise Penthouse',
        slug: 'skyline-haven-high-rise-penthouse',
        description: 'Immerse yourself in elevated urban tranquility in Bandra West. This designer 2-bedroom penthouse features wrap-around balconies with sunset sea views, bespoke Italian marble, an acoustically isolated study with fiber WiFi, access to a state-of-the-art building fitness center and rooftop pool. Quiet, refined, and centrally situated.',
        owner: ownerUser._id,
        listingModes: ['rent', 'stay'],
        propertyType: 'penthouse',
        location: {
          address: 'Level 28, Coastal Crest, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '400050',
          coordinates: { lat: 19.0596, lng: 72.8295 }
        },
        specs: {
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1650,
          maxGuests: 4,
          furnishing: 'furnished',
          yearBuilt: 2022,
          parkingSpaces: 2
        },
        pricing: {
          nightly: 190,
          weekly: 1150,
          monthly: 1950,
          salePrice: 920000,
          cleaningFee: 40,
          securityDeposit: 400,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Gym / Fitness Center',
          'Swimming Pool',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Elevator',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: true,
        isVerified: true,
        stats: {
          viewsCount: 2310,
          favoritesCount: 142,
          averageRating: 4.92,
          reviewsCount: 22
        }
      },
      {
        title: 'The Green Oasis Tech Executive Suite',
        slug: 'the-green-oasis-tech-executive-suite',
        description: 'Surrounded by tranquil jacaranda trees in Indiranagar, this modern 2-bedroom residence is curated specifically for modern tech professionals and remote founders. Includes dual standing desks, 1Gbps symmetrical fiber, pet-friendly courtyard access, fully equipped modular kitchen, and private parking. Walking distance to 100ft road cafes.',
        owner: ownerUser._id,
        listingModes: ['rent', 'stay'],
        propertyType: 'apartment',
        location: {
          address: '42 Defense Colony, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          zipCode: '560038',
          coordinates: { lat: 12.9719, lng: 77.6412 }
        },
        specs: {
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1400,
          maxGuests: 4,
          furnishing: 'furnished',
          yearBuilt: 2021,
          parkingSpaces: 1
        },
        pricing: {
          nightly: 95,
          weekly: 580,
          monthly: 1400,
          salePrice: 420000,
          cleaningFee: 30,
          securityDeposit: 250,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Dedicated Workspace',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Pet Friendly',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: true,
        isVerified: true,
        stats: {
          viewsCount: 1890,
          favoritesCount: 97,
          averageRating: 4.88,
          reviewsCount: 18
        }
      },
      {
        title: 'Palm Jumeirah Ultra-Luxury Waterfront Villa',
        slug: 'palm-jumeirah-waterfront-villa',
        description: 'An architectural icon on Palm Jumeirah with private white sand beach and direct views of the Dubai Marina skyline. 4 expansive bedroom suites, private infinity pool, cinema room, Italian designer kitchen, sauna, and private boat dock. Available for luxury vacation stays or direct sale.',
        owner: sellerUser._id,
        listingModes: ['buy', 'stay'],
        propertyType: 'villa',
        location: {
          address: 'Frond M, Palm Jumeirah',
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          zipCode: '00000',
          coordinates: { lat: 25.1124, lng: 55.1390 }
        },
        specs: {
          bedrooms: 4,
          bathrooms: 5,
          squareFeet: 5200,
          maxGuests: 8,
          furnishing: 'furnished',
          yearBuilt: 2024,
          parkingSpaces: 4
        },
        pricing: {
          nightly: 650,
          weekly: 4100,
          monthly: 14500,
          salePrice: 2850000,
          cleaningFee: 120,
          securityDeposit: 1000,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Swimming Pool',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: true,
        isVerified: true,
        stats: {
          viewsCount: 3120,
          favoritesCount: 215,
          averageRating: 4.98,
          reviewsCount: 31
        }
      },
      {
        title: 'Tribeca Cast-Iron Sunlit Loft',
        slug: 'tribeca-cast-iron-sunlit-loft',
        description: 'Authentic Manhattan living with 14-foot beamed ceilings, exposed brick walls, original hardwood floors, and south-facing floor-to-ceiling windows. Features custom Valcucine kitchen, spa bathroom with soaking tub, building rooftop terrace, and full-time doorman.',
        owner: sellerUser._id,
        listingModes: ['rent', 'stay', 'buy'],
        propertyType: 'apartment',
        location: {
          address: '78 Franklin Street, Tribeca',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10013',
          coordinates: { lat: 40.7183, lng: -74.0044 }
        },
        specs: {
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1850,
          maxGuests: 4,
          furnishing: 'furnished',
          yearBuilt: 2019,
          parkingSpaces: 1
        },
        pricing: {
          nightly: 380,
          weekly: 2300,
          monthly: 4600,
          salePrice: 2450000,
          cleaningFee: 90,
          securityDeposit: 500,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Dedicated Workspace',
          'Kitchen',
          'Elevator',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: false,
        isVerified: true,
        stats: {
          viewsCount: 1650,
          favoritesCount: 88,
          averageRating: 4.89,
          reviewsCount: 16
        }
      },
      {
        title: 'Mayfair Victorian Classic Townhouse',
        slug: 'mayfair-victorian-classic-townhouse',
        description: 'A prestigious residence in the heart of London, combining grand period elegance with contemporary luxuries. Includes landscaped private courtyard, wine cellar, marble fireplace, high ceilings, underfloor heating, and bespoke joinery throughout.',
        owner: sellerUser._id,
        listingModes: ['buy', 'rent'],
        propertyType: 'townhouse',
        location: {
          address: '18 Chesterfield Hill, Mayfair',
          city: 'London',
          state: 'England',
          country: 'UK',
          zipCode: 'W1J 5BG',
          coordinates: { lat: 51.5074, lng: -0.1478 }
        },
        specs: {
          bedrooms: 4,
          bathrooms: 4,
          squareFeet: 4100,
          maxGuests: 8,
          furnishing: 'furnished',
          yearBuilt: 2020,
          parkingSpaces: 2
        },
        pricing: {
          nightly: 0,
          weekly: 0,
          monthly: 11000,
          salePrice: 4850000,
          cleaningFee: 150,
          securityDeposit: 1500,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: false,
        isVerified: true,
        stats: {
          viewsCount: 940,
          favoritesCount: 65,
          averageRating: 4.94,
          reviewsCount: 11
        }
      },
      {
        title: 'Shinjuku Modern Zen Minimalist Studio',
        slug: 'shinjuku-modern-zen-studio',
        description: 'A serenely quiet architectural studio tucked away in residential Yotsuya, Shinjuku. Features Japanese Hinoki wood finishes, automated smart blinds, 1Gbps fiber, ergonomic Herman Miller setup, and deep soaking Hinoki bathtub. 5 minutes walk to Shinjuku Gyoen National Garden.',
        owner: elenaUser._id,
        listingModes: ['stay', 'rent'],
        propertyType: 'apartment',
        location: {
          address: '3-12 Yotsuya, Shinjuku City',
          city: 'Tokyo',
          state: 'Tokyo',
          country: 'Japan',
          zipCode: '160-0004',
          coordinates: { lat: 35.6888, lng: 139.7214 }
        },
        specs: {
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 680,
          maxGuests: 2,
          furnishing: 'furnished',
          yearBuilt: 2023,
          parkingSpaces: 0
        },
        pricing: {
          nightly: 120,
          weekly: 750,
          monthly: 1650,
          salePrice: 510000,
          cleaningFee: 35,
          securityDeposit: 200,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Air Conditioning',
          'Dedicated Workspace',
          'Kitchen',
          'Elevator',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: true,
        isVerified: true,
        stats: {
          viewsCount: 1820,
          favoritesCount: 112,
          averageRating: 4.96,
          reviewsCount: 19
        }
      },
      {
        title: 'Haussmannian Grand Balcony Apartment',
        slug: 'haussmannian-grand-balcony-paris',
        description: 'Classic 19th-century Parisian elegance overlooking the Avenue Montaigne. Features original crown moldings, chevron parquet flooring, marble fireplaces, sunlit French doors opening to an iron balcony, high-speed fiber internet, and a gourmet Lacanche kitchen.',
        owner: elenaUser._id,
        listingModes: ['stay', 'rent', 'buy'],
        propertyType: 'apartment',
        location: {
          address: '22 Avenue Montaigne',
          city: 'Paris',
          state: 'Île-de-France',
          country: 'France',
          zipCode: '75008',
          coordinates: { lat: 48.8662, lng: 2.3082 }
        },
        specs: {
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 2100,
          maxGuests: 6,
          furnishing: 'furnished',
          yearBuilt: 2021,
          parkingSpaces: 1
        },
        pricing: {
          nightly: 290,
          weekly: 1850,
          monthly: 4200,
          salePrice: 1980000,
          cleaningFee: 75,
          securityDeposit: 450,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Balcony / Patio',
          'Air Conditioning',
          'Dedicated Workspace',
          'Kitchen',
          'Elevator',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: false,
        isVerified: true,
        stats: {
          viewsCount: 1530,
          favoritesCount: 78,
          averageRating: 4.91,
          reviewsCount: 15
        }
      },
      {
        title: 'Ubud Bamboo Jungle Sanctuary Villa',
        slug: 'ubud-bamboo-jungle-sanctuary',
        description: 'An open-concept biophilic bamboo paradise floating above the Ayung River valley. Features a private curved infinity pool overlooking rainforest canopy, open-air stone bathrooms, dedicated yoga terrace, 100Mbps Starlink WiFi, and organic breakfast included daily.',
        owner: ownerUser._id,
        listingModes: ['stay', 'rent'],
        propertyType: 'villa',
        location: {
          address: 'Banjar Sayan, Ubud',
          city: 'Bali',
          state: 'Bali',
          country: 'Indonesia',
          zipCode: '80571',
          coordinates: { lat: -8.5069, lng: 115.2625 }
        },
        specs: {
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 2600,
          maxGuests: 4,
          furnishing: 'furnished',
          yearBuilt: 2023,
          parkingSpaces: 2
        },
        pricing: {
          nightly: 185,
          weekly: 1150,
          monthly: 2900,
          salePrice: 650000,
          cleaningFee: 40,
          securityDeposit: 200,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Swimming Pool',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Pet Friendly',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: true,
        isVerified: true,
        stats: {
          viewsCount: 2890,
          favoritesCount: 230,
          averageRating: 4.97,
          reviewsCount: 28
        }
      },
      {
        title: 'Pacific Heights Golden Gate View Estate',
        slug: 'pacific-heights-estate-sf',
        description: 'Unrivaled panoramic vistas of the Golden Gate Bridge, Alcatraz, and the bay from every level. Custom architectural glass remodel featuring dual home offices with wired gigabit fiber, temperature-controlled 1000-bottle wine cellar, private landscaped zen terrace, and Tesla Level 2 EV charging.',
        owner: sellerUser._id,
        listingModes: ['buy', 'rent'],
        propertyType: 'villa',
        location: {
          address: '2640 Broadway Street, Pacific Heights',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94115',
          coordinates: { lat: 37.7937, lng: -122.4385 }
        },
        specs: {
          bedrooms: 4,
          bathrooms: 5,
          squareFeet: 4800,
          maxGuests: 8,
          furnishing: 'furnished',
          yearBuilt: 2022,
          parkingSpaces: 2
        },
        pricing: {
          nightly: 0,
          weekly: 0,
          monthly: 9500,
          salePrice: 4200000,
          cleaningFee: 150,
          securityDeposit: 1500,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: false,
        isVerified: true,
        stats: {
          viewsCount: 1410,
          favoritesCount: 104,
          averageRating: 4.93,
          reviewsCount: 9
        }
      },
      {
        title: 'Alpine Panorama Ski Chalet & Spa',
        slug: 'alpine-panorama-ski-chalet-zermatt',
        description: 'Ski directly from your doorstep into the Sunnegga pistes. This handcrafted Swiss pine chalet boasts unobstructed Matterhorn views, a private outdoor cedar hot tub, Finnish sauna, roaring wood fireplace, and heated boot room. Available for winter luxury stays and seasonal ownership.',
        owner: elenaUser._id,
        listingModes: ['stay', 'buy'],
        propertyType: 'villa',
        location: {
          address: 'Riedweg 45',
          city: 'Zermatt',
          state: 'Valais',
          country: 'Switzerland',
          zipCode: '3920',
          coordinates: { lat: 45.9765, lng: 7.7491 }
        },
        specs: {
          bedrooms: 3,
          bathrooms: 3,
          squareFeet: 2900,
          maxGuests: 6,
          furnishing: 'furnished',
          yearBuilt: 2023,
          parkingSpaces: 1
        },
        pricing: {
          nightly: 540,
          weekly: 3400,
          monthly: 9800,
          salePrice: 2890000,
          cleaningFee: 110,
          securityDeposit: 600,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Pet Friendly',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: true,
        isVerified: true,
        stats: {
          viewsCount: 2240,
          favoritesCount: 167,
          averageRating: 4.98,
          reviewsCount: 24
        }
      },
      {
        title: 'Lutyens Heritage Courtyard Estate',
        slug: 'lutyens-heritage-courtyard-delhi',
        description: 'An elite heritage bungalow residence situated in prestigious Central Delhi. Set across half an acre of manicured lawns with banyan trees, pillared verandas, high ceilings, classical dining hall, modern gym, solar backup, and round-the-clock guarded security.',
        owner: ownerUser._id,
        listingModes: ['rent', 'buy'],
        propertyType: 'villa',
        location: {
          address: '7 Amrita Shergill Marg',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          zipCode: '110003',
          coordinates: { lat: 28.5983, lng: 77.2285 }
        },
        specs: {
          bedrooms: 4,
          bathrooms: 5,
          squareFeet: 5600,
          maxGuests: 8,
          furnishing: 'furnished',
          yearBuilt: 2020,
          parkingSpaces: 4
        },
        pricing: {
          nightly: 0,
          weekly: 0,
          monthly: 4800,
          salePrice: 3850000,
          cleaningFee: 100,
          securityDeposit: 1000,
          currency: 'USD'
        },
        amenities: [
          'High-Speed WiFi',
          'Gym / Fitness Center',
          'Air Conditioning',
          'Dedicated Workspace',
          'Balcony / Patio',
          'Kitchen',
          'Free Parking',
          'Pet Friendly',
          'Security 24/7'
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80' }
        ],
        status: 'active',
        isFeatured: false,
        isVerified: true,
        stats: {
          viewsCount: 1120,
          favoritesCount: 79,
          averageRating: 4.87,
          reviewsCount: 8
        }
      }
    ]);

    const [
      goaVilla,
      mumbaiPenthouse,
      blrSuite,
      dubaiVilla,
      nyLoft,
      londonTownhouse,
      tokyoStudio,
      parisApt,
      baliVilla,
      sfEstate,
      zermattChalet,
      delhiEstate
    ] = properties;

    console.log('[Seeding]: 3. Creating Realistic Bookings across modes...');
    const now = new Date();
    const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

    const bookings = await Booking.create([
      {
        property: goaVilla._id,
        user: tenantUser._id,
        host: ownerUser._id,
        bookingMode: 'stay',
        checkInDate: addDays(now, 7),
        checkOutDate: addDays(now, 14),
        guests: { adults: 2, children: 0, pets: 0 },
        pricing: {
          rate: 320,
          unitsCount: 7,
          subtotal: 2240,
          cleaningFee: 60,
          serviceFee: 224,
          securityDeposit: 300,
          totalAmount: 2824,
          currency: 'USD'
        },
        status: 'confirmed',
        payment: {
          provider: 'test',
          orderId: 'sim_ord_goa_01',
          paymentId: 'sim_pay_goa_01',
          paymentStatus: 'paid',
          paidAt: now
        }
      },
      {
        property: blrSuite._id,
        user: tenantUser._id,
        host: ownerUser._id,
        bookingMode: 'rent',
        checkInDate: addDays(now, 1),
        checkOutDate: addDays(now, 90),
        guests: { adults: 1, children: 0, pets: 1 },
        pricing: {
          rate: 1400,
          unitsCount: 3,
          subtotal: 4200,
          cleaningFee: 30,
          serviceFee: 140,
          securityDeposit: 1400,
          totalAmount: 5770,
          currency: 'USD'
        },
        status: 'confirmed',
        payment: {
          provider: 'test',
          orderId: 'sim_ord_blr_01',
          paymentId: 'sim_pay_blr_01',
          paymentStatus: 'paid',
          paidAt: now
        }
      },
      {
        property: tokyoStudio._id,
        user: guestUser._id,
        host: elenaUser._id,
        bookingMode: 'stay',
        checkInDate: addDays(now, -14),
        checkOutDate: addDays(now, -7),
        guests: { adults: 1, children: 0, pets: 0 },
        pricing: {
          rate: 120,
          unitsCount: 7,
          subtotal: 840,
          cleaningFee: 35,
          serviceFee: 84,
          securityDeposit: 200,
          totalAmount: 1159,
          currency: 'USD'
        },
        status: 'completed',
        payment: {
          provider: 'test',
          orderId: 'sim_ord_tokyo_past',
          paymentId: 'sim_pay_tokyo_past',
          paymentStatus: 'paid',
          paidAt: addDays(now, -15)
        }
      },
      {
        property: parisApt._id,
        user: marcusUser._id,
        host: elenaUser._id,
        bookingMode: 'stay',
        checkInDate: addDays(now, 15),
        checkOutDate: addDays(now, 20),
        guests: { adults: 2, children: 0, pets: 0 },
        pricing: {
          rate: 290,
          unitsCount: 5,
          subtotal: 1450,
          cleaningFee: 75,
          serviceFee: 145,
          securityDeposit: 450,
          totalAmount: 2120,
          currency: 'USD'
        },
        status: 'confirmed',
        payment: {
          provider: 'test',
          orderId: 'sim_ord_paris_01',
          paymentId: 'sim_pay_paris_01',
          paymentStatus: 'paid',
          paidAt: now
        }
      },
      {
        property: zermattChalet._id,
        user: buyerUser._id,
        host: elenaUser._id,
        bookingMode: 'stay',
        checkInDate: addDays(now, 30),
        checkOutDate: addDays(now, 36),
        guests: { adults: 4, children: 0, pets: 1 },
        pricing: {
          rate: 540,
          unitsCount: 6,
          subtotal: 3240,
          cleaningFee: 110,
          serviceFee: 324,
          securityDeposit: 600,
          totalAmount: 4274,
          currency: 'USD'
        },
        status: 'confirmed',
        payment: {
          provider: 'test',
          orderId: 'sim_ord_zermatt_01',
          paymentId: 'sim_pay_zermatt_01',
          paymentStatus: 'paid',
          paidAt: now
        }
      }
    ]);

    console.log('[Seeding]: 4. Creating Purchase Offers & Scheduled Visits...');
    const offers = await Offer.create([
      {
        property: goaVilla._id,
        buyer: buyerUser._id,
        seller: ownerUser._id,
        offerAmount: 1400000,
        financingType: 'cash',
        preApproved: true,
        earnestMoneyDeposit: 50000,
        proposedClosingDate: addDays(now, 30),
        contingencies: ['Home Inspection', 'Clear Title Verification'],
        message: 'All-cash pre-verified buyer. Flexible closing timeframe. Ready to sign contract within 7 days.',
        status: 'countered',
        counterOffer: {
          amount: 1425000,
          terms: 'Thank you David. We can proceed at $1,425,000 with current custom Italian furnishings included.',
          counteredAt: now
        },
        scheduledVisit: {
          requestedDate: addDays(now, 4),
          timeSlot: '11:00 AM - 12:00 PM',
          notes: 'Private architect walkthrough.',
          status: 'confirmed'
        }
      },
      {
        property: nyLoft._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerAmount: 2400000,
        financingType: 'cash',
        preApproved: true,
        earnestMoneyDeposit: 100000,
        proposedClosingDate: addDays(now, 45),
        contingencies: ['Board Approval'],
        message: 'Pre-approved jumbo cash transaction. Full documentation ready for Tribeca co-op/condo board review.',
        status: 'pending',
        scheduledVisit: {
          requestedDate: addDays(now, 3),
          timeSlot: '02:00 PM - 03:00 PM',
          notes: 'Buyer representative visit.',
          status: 'confirmed'
        }
      },
      {
        property: dubaiVilla._id,
        buyer: marcusUser._id,
        seller: sellerUser._id,
        offerAmount: 2750000,
        financingType: 'conventional_mortgage',
        preApproved: true,
        earnestMoneyDeposit: 80000,
        proposedClosingDate: addDays(now, 60),
        contingencies: ['Valuation Report', 'Clear Title'],
        message: 'Submitting firm offer for Palm Jumeirah property with 30% initial equity deposit verified.',
        status: 'pending',
        scheduledVisit: {
          requestedDate: addDays(now, 8),
          timeSlot: '04:00 PM - 05:00 PM',
          notes: 'Family private viewing.',
          status: 'requested'
        }
      },
      {
        property: londonTownhouse._id,
        buyer: buyerUser._id,
        seller: sellerUser._id,
        offerAmount: 4800000,
        financingType: 'cash',
        preApproved: true,
        earnestMoneyDeposit: 250000,
        proposedClosingDate: addDays(now, 40),
        contingencies: ['Structural Survey'],
        message: 'Full asking valuation subject to clean surveyor report on period roof and masonry.',
        status: 'accepted'
      }
    ]);

    console.log('[Seeding]: 5. Creating Verified Multi-Category Reviews...');
    await Review.create([
      {
        property: goaVilla._id,
        user: tenantUser._id,
        rating: 5,
        categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'Absolutely stunning cliffside view! The high-speed internet allowed us to work smoothly while enjoying the sound of waves. Priya was a wonderful host.',
        responseFromOwner: 'Thank you Sarah! It was an absolute delight hosting you. You are welcome anytime!'
      },
      {
        property: mumbaiPenthouse._id,
        user: guestUser._id,
        rating: 5,
        categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'Spectacular Bandra sunset views. Modern, sparkling clean, and the building amenities (gym and pool) are top notch.',
        responseFromOwner: 'Glad you enjoyed the sunset over the Arabian Sea Anya!'
      },
      {
        property: blrSuite._id,
        user: tenantUser._id,
        rating: 5,
        categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'The 1Gbps fiber internet and ergonomic standing desk made this the ideal remote work apartment in Bangalore. Very quiet street near Indiranagar cafes.',
        responseFromOwner: 'Thanks Sarah! We built the suite specifically for focused remote work.'
      },
      {
        property: tokyoStudio._id,
        user: guestUser._id,
        rating: 5,
        categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'Pure serenity in the middle of Tokyo. The Hinoki soaking tub and minimalist smart design made for the best sleep of my trip.',
        responseFromOwner: 'Arigato gozaimasu Anya! So pleased you appreciated the Hinoki craftsmanship.'
      },
      {
        property: zermattChalet._id,
        user: buyerUser._id,
        rating: 5,
        categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'Unbelievable Matterhorn panorama from the hot tub. Ski-in ski-out was flawless. Elena was exceptionally responsive.',
        responseFromOwner: 'Wonderful to hear David! Come back for the powder snow next season.'
      },
      {
        property: baliVilla._id,
        user: marcusUser._id,
        rating: 5,
        categories: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'An architectural dream floating over the Ubud rainforest. Starlink internet held 100Mbps during all my video calls with London.',
        responseFromOwner: 'Thank you Marcus! The Ayung valley is truly magical.'
      }
    ]);

    console.log('[Seeding]: 6. Creating Favorites and Syncing User Saved Lists...');
    await Favorite.create([
      { user: tenantUser._id, property: mumbaiPenthouse._id },
      { user: tenantUser._id, property: blrSuite._id },
      { user: buyerUser._id, property: goaVilla._id },
      { user: buyerUser._id, property: nyLoft._id },
      { user: buyerUser._id, property: zermattChalet._id },
      { user: guestUser._id, property: tokyoStudio._id },
      { user: guestUser._id, property: parisApt._id },
      { user: marcusUser._id, property: dubaiVilla._id }
    ]);

    await User.findByIdAndUpdate(tenantUser._id, { $set: { savedProperties: [mumbaiPenthouse._id, blrSuite._id] } });
    await User.findByIdAndUpdate(buyerUser._id, { $set: { savedProperties: [goaVilla._id, nyLoft._id, zermattChalet._id] } });
    await User.findByIdAndUpdate(guestUser._id, { $set: { savedProperties: [tokyoStudio._id, parisApt._id] } });
    await User.findByIdAndUpdate(marcusUser._id, { $set: { savedProperties: [dubaiVilla._id] } });

    console.log('[Seeding]: 7. Creating In-App Conversations & Messages...');
    const conv1 = await Conversation.create({
      participants: [tenantUser._id, ownerUser._id],
      property: goaVilla._id,
      lastMessage: {
        text: 'The 500Mbps fiber is dedicated and verified with dual UPS backups. You will have zero interruptions for your Zoom calls!',
        sender: ownerUser._id,
        sentAt: addDays(now, -1)
      }
    });

    await Message.create([
      {
        conversation: conv1._id,
        sender: tenantUser._id,
        recipient: ownerUser._id,
        text: 'Hi Priya! I am planning a 1-week workation at Azure Horizon. Can you confirm the WiFi upload speed and if there is a quiet monitor desk setup?'
      },
      {
        conversation: conv1._id,
        sender: ownerUser._id,
        recipient: tenantUser._id,
        text: 'Hello Sarah! Absolutely. We have a dedicated study facing the sea with a 27-inch 4K monitor, ergonomic Herman Miller chair, and direct Ethernet port.'
      },
      {
        conversation: conv1._id,
        sender: ownerUser._id,
        recipient: tenantUser._id,
        text: 'The 500Mbps fiber is dedicated and verified with dual UPS backups. You will have zero interruptions for your Zoom calls!'
      }
    ]);

    const conv2 = await Conversation.create({
      participants: [buyerUser._id, sellerUser._id],
      property: nyLoft._id,
      lastMessage: {
        text: 'I have scheduled the building superintendent for Thursday 2 PM so you can inspect the storage and rooftop terrace as well.',
        sender: sellerUser._id,
        sentAt: now
      }
    });

    await Message.create([
      {
        conversation: conv2._id,
        sender: buyerUser._id,
        recipient: sellerUser._id,
        text: 'Vikram, I submitted an all-cash offer on the Tribeca Loft with standard board approval contingency. Can we tour the mechanical room and rooftop?'
      },
      {
        conversation: conv2._id,
        sender: sellerUser._id,
        recipient: buyerUser._id,
        text: 'I have scheduled the building superintendent for Thursday 2 PM so you can inspect the storage and rooftop terrace as well.'
      }
    ]);

    console.log('[Seeding]: 8. Creating In-App Notifications...');
    await Notification.create([
      {
        recipient: ownerUser._id,
        sender: buyerUser._id,
        type: 'offer_received',
        title: 'New Offer Received!',
        message: 'David Chen submitted an offer of $1,400,000 on "Azure Horizon Oceanfront Villa".',
        link: '/dashboard/owner'
      },
      {
        recipient: tenantUser._id,
        sender: ownerUser._id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed!',
        message: 'Your upcoming stay at "Azure Horizon Oceanfront Villa" is confirmed.',
        link: '/dashboard/user'
      },
      {
        recipient: sellerUser._id,
        sender: buyerUser._id,
        type: 'offer_received',
        title: 'Purchase Proposal on Tribeca Loft',
        message: 'David Chen submitted an all-cash offer of $2,400,000 on "Tribeca Cast-Iron Sunlit Loft".',
        link: '/dashboard/owner'
      },
      {
        recipient: marcusUser._id,
        sender: elenaUser._id,
        type: 'booking_confirmed',
        title: 'Paris Stay Confirmed!',
        message: 'Your reservation for "Haussmannian Grand Balcony Apartment" is confirmed.',
        link: '/dashboard/user'
      },
      {
        recipient: ownerUser._id,
        sender: tenantUser._id,
        type: 'review_received',
        title: 'New 5-Star Review!',
        message: 'Sarah Jenkins left a 5-star review for Azure Horizon Oceanfront Villa.',
        link: '/properties/' + goaVilla._id
      }
    ]);

    console.log('[Seeding]: 9. Creating Moderation & Fraud Reports for Admin Dashboard...');
    await Report.create([
      {
        reporter: tenantUser._id,
        property: nyLoft._id,
        reason: 'inaccurate_listing',
        details: 'Third-party aggregator posted outdated square footage figures; verifying verified dimensions on official floor plan.',
        status: 'resolved',
        resolutionNotes: 'Verified against registered condominium deed. Floor plan dimensions updated to exact 1,850 sq ft.',
        resolvedBy: adminUser._id
      },
      {
        reporter: guestUser._id,
        property: delhiEstate._id,
        reason: 'safety_concerns',
        details: 'User requested confirmation of gated security guard shift hours.',
        status: 'pending'
      }
    ]);

    console.log('\n============================================================');
    console.log('🎉 SUCCESS! Rich demo dataset loaded into MongoDB Atlas!');
    console.log('   • Users:         8 (All roles active)');
    console.log('   • Properties:    12 (Stay, Rent & Buy in 12 global cities)');
    console.log('   • Bookings:      5 (Confirmed stays and active leases)');
    console.log('   • Offers:        4 (Countered, accepted, and pending offers)');
    console.log('   • Reviews:       6 (5-star verified reviews with host replies)');
    console.log('   • Favorites:     8 (Saved properties across users)');
    console.log('   • Conversations: 2 (Active chat threads)');
    console.log('   • Messages:      5 (Real back-and-forth messages)');
    console.log('   • Notifications: 5 (Activity updates across users)');
    console.log('   • Reports:       2 (Admin moderation queue items)');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seeding Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
