import { Server as SocketIOServer } from 'socket.io';

export class RealtimeService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // User joins their personal room
      socket.on('join_user_room', (userId: string) => {
        socket.join(`user_${userId}`);
        this.connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} joined room user_${userId}`);

        // Emit online status to relevant users
        this.broadcastUserStatus(userId, 'online');
      });

      // Join order-specific chat room
      socket.on('join_order_chat', (orderId: string) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} joined order_${orderId}`);
      });

      // Handle chat messages
      socket.on('send_message', (data: {
        orderId: string;
        senderId: string;
        content: string;
        messageType: 'text' | 'image' | 'file';
      }) => {
        const message = {
          id: this.generateId(),
          orderId: data.orderId,
          senderId: data.senderId,
          content: data.content,
          messageType: data.messageType,
          timestamp: new Date(),
          isRead: false
        };

        // Broadcast to all users in the order chat
        this.io.to(`order_${data.orderId}`).emit('receive_message', message);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { orderId: string; userId: string; userName: string }) => {
        socket.to(`order_${data.orderId}`).emit('user_typing', {
          userId: data.userId,
          userName: data.userName,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data: { orderId: string; userId: string }) => {
        socket.to(`order_${data.orderId}`).emit('user_typing', {
          userId: data.userId,
          isTyping: false
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Find and remove user from connected users
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            this.broadcastUserStatus(userId, 'offline');
            break;
          }
        }
      });
    });
  }

  // Notification methods
  public sendNotification(userId: string, notification: any) {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  public sendOrderUpdate(userId: string, orderData: any) {
    this.io.to(`user_${userId}`).emit('order_update', orderData);
  }

  public sendNewOrder(supplierId: string, orderData: any) {
    this.io.to(`user_${supplierId}`).emit('new_order', orderData);
  }

  public sendOrderApproved(vendorId: string, orderData: any) {
    this.io.to(`user_${vendorId}`).emit('order_approved', orderData);
  }

  public sendOrderRejected(vendorId: string, orderData: any) {
    this.io.to(`user_${vendorId}`).emit('order_rejected', orderData);
  }

  public sendContractUpdate(userId: string, contractData: any) {
    this.io.to(`user_${userId}`).emit('contract_update', contractData);
  }

  public sendSupplierRegistration(vendorIds: string[], supplierData: any) {
    vendorIds.forEach(vendorId => {
      this.io.to(`user_${vendorId}`).emit('new_supplier', supplierData);
    });
  }

  public sendStockAlert(supplierId: string, stockData: any) {
    this.io.to(`user_${supplierId}`).emit('stock_alert', stockData);
  }

  public sendPaymentReminder(userId: string, paymentData: any) {
    this.io.to(`user_${userId}`).emit('payment_reminder', paymentData);
  }

  // Utility methods
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  private broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    // Broadcast to all connected users (can be optimized to only relevant users)
    this.io.emit('user_status_change', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

export default RealtimeService;