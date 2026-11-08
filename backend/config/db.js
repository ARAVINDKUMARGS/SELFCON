const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const forceMemory = process.env.USE_MEMORY_DB === 'true';

    if (!forceMemory && mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      // Direct remote connection (e.g. MongoDB Atlas)
      const conn = await mongoose.connect(mongoUri);
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      return conn;
    }

    if (!forceMemory && mongoUri) {
      try {
        const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log(`[MongoDB Local Connected]: ${conn.connection.host}`);
        return conn;
      } catch (localErr) {
        console.warn(`[MongoDB Warning]: Local MongoDB connection failed (${localErr.message}). Falling back to MongoMemoryServer.`);
      }
    }

    // Graceful in-memory fallback
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { dbName: 'selfcon' }
      });
      const inMemoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB Connected]: In-Memory instance running at ${inMemoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB Error]: Could not start in-memory server: ${memErr.message}`);
      throw memErr;
    }
  } catch (error) {
    console.error(`[Database Error]: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };

