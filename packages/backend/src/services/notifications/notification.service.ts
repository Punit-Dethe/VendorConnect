interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: Date;
}

class NotificationService {
  private notifications: Notification[] = [];

  // Create notification
  createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: any = {}
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    return notification;
  }

  // Get user notifications
  getUserNotifications(userId: string, limit: number = 50): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Get unread notifications
  getUnreadNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId && !n.isRead);
  }

  // Get notification count
  getNotificationCount(userId: string): { total: number; unread: number } {
    const userNotifications = this.notifications.filter(n => n.userId === userId);
    return {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.isRead).length
    };
  }

  // Mark as read
  markAsRead(notificationId: string, userId: string): boolean {
    const notification = this.notifications.find(
      n => n.id === notificationId && n.userId === userId
    );

    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  // Mark all as read
  markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.filter(
      n => n.userId === userId && !n.isRead
    );

    userNotifications.forEach(n => n.isRead = true);
    return userNotifications.length;
  }

  // Delete notification
  deleteNotification(notificationId: string, userId: string): boolean {
    const index = this.notifications.findIndex(
      n => n.id === notificationId && n.userId === userId
    );

    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  // Notification templates
  createOrderNotification(supplierId: string, order: any, vendor: any): Notification {
    return this.createNotification(
      supplierId,
      'order_received',
      'New Order Received!',
      `${vendor.name} has placed a new order worth ₹${order.totalAmount}`,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        vendorId: vendor.id,
        vendorName: vendor.name,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        action: 'view_order'
      }
    );
  }

  createOrderApprovedNotification(vendorId: string, order: any, supplier: any): Notification {
    return this.createNotification(
      vendorId,
      'order_approved',
      'Order Approved!',
      `${supplier.name} has approved your order ${order.orderNumber}`,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        totalAmount: order.totalAmount,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        action: 'view_contract'
      }
    );
  }

  createOrderRejectedNotification(vendorId: string, order: any, supplier: any, reason: string): Notification {
    return this.createNotification(
      vendorId,
      'order_rejected',
      'Order Rejected',
      `${supplier.name} has rejected your order ${order.orderNumber}`,
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        reason,
        totalAmount: order.totalAmount,
        action: 'view_order'
      }
    );
  }

  createContractSignedNotification(userId: string, contract: any, signerName: string): Notification {
    return this.createNotification(
      userId,
      'contract_signed',
      'Contract Signed!',
      `${signerName} has signed contract ${contract.contractNumber}`,
      {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        signerName,
        status: contract.status,
        action: 'view_contract'
      }
    );
  }

  createPaymentReminderNotification(vendorId: string, payment: any): Notification {
    return this.createNotification(
      vendorId,
      'payment_reminder',
      'Payment Due Reminder',
      `Payment of ₹${payment.amount} is due on ${payment.dueDate}`,
      {
        paymentId: payment.id,
        amount: payment.amount,
        dueDate: payment.dueDate,
        orderNumber: payment.orderNumber,
        action: 'make_payment'
      }
    );
  }

  createStockAlertNotification(supplierId: string, product: any): Notification {
    return this.createNotification(
      supplierId,
      'stock_alert',
      'Low Stock Alert',
      `${product.name} is running low on stock (${product.stockQuantity} remaining)`,
      {
        productId: product.id,
        productName: product.name,
        currentStock: product.stockQuantity,
        minRequired: product.minOrderQuantity,
        action: 'restock_product'
      }
    );
  }

  createSupplierRegistrationNotification(vendorId: string, supplier: any): Notification {
    return this.createNotification(
      vendorId,
      'new_supplier',
      'New Supplier Available',
      `${supplier.name} has joined as a supplier in your area`,
      {
        supplierId: supplier.id,
        supplierName: supplier.name,
        businessType: supplier.businessType,
        city: supplier.city,
        categories: supplier.categories,
        action: 'view_supplier'
      }
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

export default new NotificationService();