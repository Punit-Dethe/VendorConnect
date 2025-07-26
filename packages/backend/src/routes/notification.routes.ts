import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getNotifications,
  getUnreadNotifications,
  getNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// Get all notifications
router.get('/', getNotifications);

// Get unread notifications
router.get('/unread', getUnreadNotifications);

// Get notification count
router.get('/count', getNotificationCount);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;