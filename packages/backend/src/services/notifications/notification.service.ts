import { query } from '../../config/database';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: Date;
}

class NotificationService {
  async createNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification> {
    const result = await query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, type, title, message, data ? JSON.stringify(data) : null]);

    return result.rows[0];
  }

  async getUserNotifications(userId: number, limit: number = 50): Promise<Notification[]> {
    const result = await query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : null
    }));
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const result = await query(`
      SELECT * FROM notifications
      WHERE user_id = $1 AND is_read = false
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : null
    }));
  }

  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await query(`
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
    `, [notificationId, userId]);

    return result.rowCount > 0;
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await query(`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
    `, [userId]);

    return result.rowCount;
  }

  async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
    const result = await query(`
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
    `, [notificationId, userId]);

    return result.rowCount > 0;
  }

  async getNotificationCount(userId: number): Promise<{ total: number; unread: number }> {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread
      FROM notifications
      WHERE user_id = $1
    `, [userId]);

    return {
      total: parseInt(result.rows[0].total),
      unread: parseInt(result.rows[0].unread)
    };
  }

  // Predefined notification types for different events
  async notifyNewOrder(supplierId: number, orderId: number, vendorName: string, orderNumber: string) {
    return this.createNotification(
      supplierId,
      'new_order',
      'New Order Received! 🛒',
      `${vendorName} has placed a new order #${orderNumber}. Please review and approve.`,
      { orderId, orderNumber }
    );
  }

  async notifyOrderApproved(vendorId: number, orderId: number, supplierName: string, orderNumber: string) {
    return this.createNotification(
      vendorId,
      'order_approved',
      'Order Approved! ✅',
      `Your order #${orderNumber} has been approved by ${supplierName}.`,
      { orderId, orderNumber }
    );
  }

  async notifyOrderRejected(vendorId: number, orderId: number, supplierName: string, orderNumber: string, reason?: string) {
    return this.createNotification(
      vendorId,
      'order_rejected',
      'Order Rejected ❌',
      `Your order #${orderNumber} has been rejected by ${supplierName}.${reason ? ` Reason: ${reason}` : ''}`,
      { orderId, orderNumber, reason }
    );
  }

  async notifyPaymentDue(vendorId: number, orderId: number, amount: number, dueDate: string) {
    return this.createNotification(
      vendorId,
      'payment_due',
      'Payment Due 💰',
      `Payment of ₹${amount} is due on ${dueDate} for your order.`,
      { orderId, amount, dueDate }
    );
  }

  async notifyPaymentReceived(supplierId: number, orderId: number, amount: number, vendorName: string) {
    return this.createNotification(
      supplierId,
      'payment_received',
      'Payment Received! 💸',
      `Payment of ₹${amount} received from ${vendorName}.`,
      { orderId, amount }
    );
  }

  async notifyProductRestocked(vendorId: number, productId: number, productName: string, supplierName: string) {
    return this.createNotification(
      vendorId,
      'product_restocked',
      'Product Back in Stock! 📦',
      `"${productName}" is now available from ${supplierName}.`,
      { productId, productName }
    );
  }

  async notifyLowStock(supplierId: number, productId: number, productName: string, currentStock: number) {
    return this.createNotification(
      supplierId,
      'low_stock',
      'Low Stock Alert! ⚠️',
      `"${productName}" is running low (${currentStock} remaining). Consider restocking.`,
      { productId, productName, currentStock }
    );
  }

  async notifyContractSigned(userId: number, contractId: number, contractNumber: string, counterpartyName: string) {
    return this.createNotification(
      userId,
      'contract_signed',
      'Contract Fully Executed! 📋',
      `Contract #${contractNumber} has been signed by both parties.`,
      { contractId, contractNumber }
    );
  }

  async notifyNewSupplier(vendorId: number, supplierId: number, supplierName: string, businessName: string) {
    return this.createNotification(
      vendorId,
      'new_supplier',
      'New Supplier Available! 🏪',
      `${businessName} (${supplierName}) has joined the platform and is now available in your area.`,
      { supplierId, supplierName, businessName }
    );
  }
}

export default new NotificationService();