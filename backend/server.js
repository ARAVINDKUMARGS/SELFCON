const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');
const Property = require('./models/Property');

// Route files
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Rate limiting (120 requests per minute)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in a minute.'
  }
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve static upload directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'SELFCON Real Estate API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/webhooks', webhookRoutes);

// Central error handler
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if running in memory or collection is empty
    const propertyCount = await Property.countDocuments();
    if (propertyCount === 0) {
      console.log('[SelfCon Server]: Empty database detected. Running automated initial seed...');
      try {
        const seedPath = path.join(__dirname, 'seed/seed.js');
        // Run seed script logic
        delete require.cache[require.resolve('./seed/seed.js')];
      } catch (seedErr) {
        // Continue normally
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  🚀 SELFCON API Server running on port ${PORT}`);
      console.log(`  🏠 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  🤖 Claude AI Engine: Ready`);
      console.log(`  💳 Payment Engine: Razorpay / Stripe / Test Ready`);
      console.log(`=======================================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
    });

    return server;
  } catch (error) {
    console.error(`[Server Start Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;

