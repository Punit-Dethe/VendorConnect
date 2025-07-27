import React from 'react';
import { Notification } from '@vendor-supplier/shared/src/types'; // Assuming Notification type is available

interface RecentNotificationsListProps {
  notifications: Notification[];
}

const RecentNotificationsList: React.FC<RecentNotificationsListProps> = ({
  notifications,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Notifications
      </h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent notifications</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-sm text-gray-600">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.sentAt).toLocaleString()} {/* Changed to sentAt */}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentNotificationsList; 