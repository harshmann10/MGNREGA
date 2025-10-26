const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas with retry logic
 * Implements exponential backoff for connection failures
 */
const connectDatabase = async (retries = 5, delay = 5000) => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  let attempt = 0;
  while (attempt < retries) {
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB connected successfully to: ${mongoose.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      return mongoose.connection;
    } catch (error) {
      attempt++;
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt < retries) {
        const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('❌ All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDatabase;
