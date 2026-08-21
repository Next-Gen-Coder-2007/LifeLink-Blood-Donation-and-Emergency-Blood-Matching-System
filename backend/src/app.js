import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler, AppError } from './middlewares/errorMiddleware.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  config.clientUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Fast database connection readiness check (crucial for serverless environments & ultra-low latency)
app.use(async (req, res, next) => {
  // Allow root health check to respond immediately
  if (req.path === '/' && req.method === 'GET') {
    return next();
  }
  // If already connected, pass through immediately with zero overhead
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    next(
      new AppError(
        `Database connection failed: ${error.message}. Please check MONGODB_URL and MongoDB Atlas Network Access (IP Whitelist 0.0.0.0/0).`,
        500
      )
    );
  }
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
