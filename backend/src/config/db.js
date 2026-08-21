import mongoose from 'mongoose';
import { config } from './env.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: false, // Prevents blocking index builds during runtime connection
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to eliminate IPv6 DNS lookup stalls on Windows/Atlas
    };

    cached.promise = mongoose
      .connect(config.mongodbUrl, opts)
      .then((mongooseInstance) => {
        console.log('MongoDB connected successfully (Pool: min=2, max=10, family=IPv4)');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export const initIndexes = async () => {
  try {
    const models = mongoose.modelNames();
    for (const modelName of models) {
      await mongoose.model(modelName).syncIndexes();
    }
  } catch (err) {
    console.warn('Background index sync notice:', err.message);
  }
};

