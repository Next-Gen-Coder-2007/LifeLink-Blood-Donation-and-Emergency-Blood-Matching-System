import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import donorRoutes from './donorRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import bloodRequestRoutes from './bloodRequestRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'LifeLink API is running',
    version: '1.0.0',
    platform: 'Node.js & MongoDB (Mongoose)',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

router.use('/', authRoutes);
router.use('/users', userRoutes);
router.use('/donors', donorRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/blood-requests', bloodRequestRoutes);
router.use('/analytics', analyticsRoutes);

router.use('/api/v1', authRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/donors', donorRoutes);
router.use('/api/v1/hospitals', hospitalRoutes);
router.use('/api/v1/blood-requests', bloodRequestRoutes);
router.use('/api/v1/analytics', analyticsRoutes);

export default router;
