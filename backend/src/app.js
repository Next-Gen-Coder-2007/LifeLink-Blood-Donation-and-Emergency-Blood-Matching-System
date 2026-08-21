import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // Cache preflight requests for 24h to avoid OPTIONS roundtrips
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
