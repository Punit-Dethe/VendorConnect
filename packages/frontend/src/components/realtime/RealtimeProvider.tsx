import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  onlineUsers: string[];
  joinUserRoom: (userId: string) => void;
  joinOrderChat: (orderId: string) => void;
  sendMessage: (orderId: string, content: string) => void;
  markNotificationRead: (notificationId: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children, userId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);

      // Join user room if userId is available
      if (userId) {
        newSocket.emit('join_user_room', userId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Real-time notification handlers
    newSocket.on('notification', (notification) => {
      console.log('New notification:', notification);
      setNotifications(prev => [notification, ...prev]);

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    // Order-related events
    newSocket.on('new_order', (data) => {
      console.log('New order received:', data);
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'order_received',
        title: 'New Order Received!',
        message: `${data.vendor.name} has placed a new order`,
        data: data,
        isRead: false,
        createdAt: new Date()
      }, ...prev]);
    });

    newSocket.on('order_approved', (data) => {
      console.log('Order approved:', data);
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'order_approved',
        title: 'Order Approved!',
        message: `Your order has been approved by ${data.supplier.name}`,
        data: data,
        isRead: false,
        createdAt: new Date()
      }, ...prev]);
    });

    newSocket.on('order_rejected', (data) => {
      console.log('Order rejected:', data);
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'order_rejected',
        title: 'Order Rejected',
        message: `Your order was rejected by ${data.supplier.name}`,
        data: data,
        isRead: false,
        createdAt: new Date()
      }, ...prev]);
    });

    newSocket.on('contract_signed', (data) => {
      console.log('Contract signed:', data);
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'contract_signed',
        title: 'Contract Signed!',
        message: `Contract ${data.contractNumber} has been signed`,
        data: data,
        isRead: false,
        createdAt: new Date()
      }, ...prev]);
    });

    newSocket.on('new_supplier', (data) => {
      console.log('New supplier registered:', data);
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'new_supplier',
        title: 'New Supplier Available',
        message: `${data.name} has joined as a supplier in your area`,
        data: data,
        isRead: false,
        createdAt: new Date()
      }, ...prev]);
    });

    newSocket.on('user_status_change', (data) => {
      setOnlineUsers(prev => {
        if (data.status === 'online') {
          return [...prev.filter(id => id !== data.userId), data.userId];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    });

    setSocket(newSocket);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const joinUserRoom = (userId: string) => {
    if (socket) {
      socket.emit('join_user_room', userId);
    }
  };

  const joinOrderChat = (orderId: string) => {
    if (socket) {
      socket.emit('join_order_chat', orderId);
    }
  };

  const sendMessage = (orderId: string, content: string) => {
    if (socket && userId) {
      socket.emit('send_message', {
        orderId,
        senderId: userId,
        content,
        messageType: 'text'
      });
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const value: RealtimeContextType = {
    socket,
    isConnected,
    notifications,
    onlineUsers,
    joinUserRoom,
    joinOrderChat,
    sendMessage,
    markNotificationRead
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeProvider;