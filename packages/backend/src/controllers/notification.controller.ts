import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notifications/notification.service';
import { AppError } from '../middleware/error.middleware';
import { ApiResponse, Notification } from '@vendor-supplier/shared/src/types';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id; // Assuming user ID is available from authentication middleware
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
      }
      const notifications = await this.notificationService.getNotificationsByUserId(userId);
      const response: ApiResponse<Notification[]> = { success: true, data: notifications };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
      }
      const updatedNotification = await this.notificationService.markAsRead(id, userId);
      if (!updatedNotification) {
        return next(new AppError('Notification not found or update failed', 404, 'UPDATE_FAILED'));
      }
      const response: ApiResponse<Notification> = { success: true, data: updatedNotification };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
      }
      await this.notificationService.deleteNotification(id, userId);
      res.status(200).json({ success: true, data: { message: 'Notification deleted successfully' } });
    } catch (error) {
      next(error);
    }
  };

  clearAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
      }
      await this.notificationService.clearAllNotifications(userId);
      res.status(200).json({ success: true, data: { message: 'All notifications cleared successfully' } });
    } catch (error) {
      next(error);
    }
  };
}