import { Router } from 'express';
import { getPlatformStats } from '../controllers/analyticsController.js';

const router = Router();

router.get('/stats', getPlatformStats);

export default router;
