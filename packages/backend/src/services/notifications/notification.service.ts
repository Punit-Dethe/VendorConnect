import { NotificationRepository } from '@repositories/notification.repository';
import { pool } from '@database/connection';
import { AppError } from '@middleware/error.middleware';
import { Notification } from '@vendor-supplier/shared/src/types';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository(pool);
  }

  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    if (!notificationData.userId || !notificationData.message || !notificationData.type) {
      throw new AppError('Missing required notification fields', 400, 'VALIDATION_ERROR');
    }
    return this.notificationRepository.create(notificationData);
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found or unauthorized', 404, 'NOT_FOUND');
    }
    return this.notificationRepository.update(notificationId, { isRead: true });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found or unauthorized', 404, 'NOT_FOUND');
    }
    await this.notificationRepository.delete(notificationId);
  }

  async clearAllNotifications(userId: string): Promise<void> {
    await this.notificationRepository.deleteAllByUserId(userId);
  }
}