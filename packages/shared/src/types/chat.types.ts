export interface ChatRoom {
  id: string;
  orderId: string;
  vendorId: string;
  supplierId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  messageType: 'text' | 'image' | 'file';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: Date;
}

export interface SendMessageRequest {
  roomId: string;
  messageType: 'text' | 'image' | 'file';
  content: string;
  file?: File;
}

export interface ChatNotification {
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}