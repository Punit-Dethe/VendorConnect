import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticateToken } from '@middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticateToken); // All notification routes require authentication

router.get('/me', notificationController.getNotifications);
router.put('/:id/read', notificationController.markNotificationAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/clear-all', notificationController.clearAllNotifications);

export default router;