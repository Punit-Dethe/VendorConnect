export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
}

export type NotificationType =
  | 'order_received'
  | 'order_accepted'
  | 'order_rejected'
  | 'order_delivered'
  | 'payment_due'
  | 'payment_received'
  | 'contract_signed'
  | 'trust_score_updated'
  | 'low_stock_alert'
  | 'recurring_order_reminder'
  | 'chat_message';

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderReminders: boolean;
  paymentReminders: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}