import { RealtimeService } from '@services/realtime/realtime.service';
import { io } from 'src/server'; // Assuming your Socket.IO server instance is exported from src/server.ts
import { Notification } from '@vendor-supplier/shared/src/types';

const realtimeService = new RealtimeService(io);

// Example usage: Emitting a notification to a specific user
export const emitNotificationToUser = (userId: string, notification: Notification) => {
  realtimeService.emitToUser(userId, 'newNotification', notification);
};

// Example usage: Broadcasting a general update
export const broadcastUpdate = (event: string, data: any) => {
  realtimeService.broadcast(event, data);
};