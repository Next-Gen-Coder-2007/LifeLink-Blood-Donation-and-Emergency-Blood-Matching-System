import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import donorRoutes from './donorRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import bloodRequestRoutes from './bloodRequestRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import donationPledgeRoutes from './donationPledgeRoutes.js';
import donationHistoryRoutes from './donationHistoryRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import adminRoutes from './adminRoutes.js';
import { getBloodBank, updateBloodBank } from '../controllers/bloodBankController.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'LifeLink API is running',
    version: '1.4.0',
    platform: 'Node.js & MongoDB (Mongoose)',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const bloodInventoryRouter = Router();
bloodInventoryRouter.route('/:hospital_id')
  .get(getBloodBank)
  .put(updateBloodBank);

router.use('/', authRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/donors', donorRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/blood-requests', bloodRequestRoutes);
router.use('/blood-inventory', bloodInventoryRouter);
router.use('/analytics', analyticsRoutes);
router.use('/donation-pledges', donationPledgeRoutes);
router.use('/donation-history', donationHistoryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/matching', matchingRoutes);

export default router;

