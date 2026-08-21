import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  createNotification,
} from '../controllers/notificationController.js';

const router = Router();

router.get('/user/:user_id', getUserNotifications);
router.put('/:notification_id/read', markNotificationRead);
router.put('/user/:user_id/read-all', markAllRead);
router.delete('/:notification_id', deleteNotification);
router.post('/', createNotification);

export default router;
