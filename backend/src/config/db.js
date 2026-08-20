import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUrl, {
      autoIndex: true,
    });
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};
