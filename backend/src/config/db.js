import mongoose from 'mongoose';
import { config } from './env.js';

// Global cache for serverless environments (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (process.env.VERCEL && (!config.mongodbUrl || config.mongodbUrl.includes('127.0.0.1') || config.mongodbUrl.includes('localhost'))) {
    throw new Error('MONGODB_URL or MONGODB_URI environment variable is not set in your Vercel Project Settings.');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cached.promise = mongoose.connect(config.mongodbUrl, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error('MongoDB Connection Error:', err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};
