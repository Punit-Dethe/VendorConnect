import { useState } from 'react'
import {
  Bell,
  X,
  Check,
  Clock,
  Package,
  DollarSign,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

interface Notification {
  id: string
  type: 'order' | 'payment' | 'message' | 'system' | 'alert'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'vendor' | 'supplier'
}

export default function NotificationCenter({ isOpen, onClose, userRole }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: userRole === 'vendor' ? 'Order Delivered' : 'New Order Request',
      message: userRole === 'vendor'
        ? 'Your order ORD-2024-003 has been delivered successfully'
        : 'New order request from Street Delights for ₹2,500',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      actionUrl: userRole === 'vendor' ? '/vendor/orders' : '/supplier/orders',
      priority: 'high'
    },
    {
      id: '2',
      type: 'payment',
      title: userRole === 'vendor' ? 'Payment Due' : 'Payment Received',
      message: userRole === 'vendor'
        ? 'Payment of ₹1,800 is due for order ORD-2024-002'
        : 'Payment of ₹3,200 received for order ORD-2024-001',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      message: userRole === 'vendor'
        ? 'Fresh Vegetables Co. sent you a message about your order'
        : 'Mumbai Chaat sent you a message about their order',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'system',
      title: 'Trust Score Updated',
      message: `Your trust score has increased to ${userRole === 'vendor' ? '78' : '85'}/100`,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'alert',
      title: userRole === 'supplier' ? 'Low Stock Alert' : 'Supplier Unavailable',
      message: userRole === 'supplier'
        ? 'Red Chili Powder is running low (8kg remaining)'
        : 'Your regular supplier Spice Masters is temporarily unavailable',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      priority: 'medium'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${priority === 'high' ? 'text-red-600' :
        priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
      }`

    switch (type) {
      case 'order':
        return <Package className={iconClass} />
      case 'payment':
        return <DollarSign className={iconClass} />
      case 'message':
        return <MessageCircle className={iconClass} />
      case 'alert':
        return <AlertTriangle className={iconClass} />
      case 'system':
        return <Info className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const getNotificationBg = (priority: string, read: boolean) => {
    if (read) return 'bg-white'

    switch (priority) {
      case 'high':
        return 'bg-red-50 border-l-4 border-red-500'
      case 'medium':
        return 'bg-yellow-50 border-l-4 border-yellow-500'
      default:
        return 'bg-blue-50 border-l-4 border-blue-500'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-xl max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationBg(notification.priority, notification.read)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {notification.actionUrl && (
                        <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">
                          View Details →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}