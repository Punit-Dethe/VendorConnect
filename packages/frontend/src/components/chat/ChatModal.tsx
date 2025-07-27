import { useState, useRef, useEffect } from 'react'
import {
  X,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { useRealtime } from '../../components/realtime/RealtimeProvider'
import api from '../../services/api'

interface Message {
  id: string
  sender_id: string
  sender_name: string // Assuming senderName comes from backend or can be looked up
  content: string
  created_at: string // Use string for ISO date from backend
  message_type: 'text' | 'image' | 'file'
  room_id?: string; // Add room_id for chat messages
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName: string
  recipientId: string
  chatRoomId: string // This will typically be the orderId for order-specific chats
}

export default function ChatModal({ isOpen, onClose, recipientName, recipientId, chatRoomId }: ChatModalProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { socket, joinOrderChat, sendMessage } = useRealtime();
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!isOpen || !chatRoomId) return;

    // Join the chat room
    joinOrderChat(chatRoomId);

    // Load initial messages
    const loadMessages = async () => {
      try {
        const response = await api.get(`/api/chat/messages/${chatRoomId}`);
        setMessages(response.data.data);
        // Mark messages as read if current user is recipient
        // This logic might need to be more sophisticated if roles are mixed
        // For now, assuming current user is sender or recipient.
        // A proper backend endpoint would handle marking as read.
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    loadMessages();

    // Listen for new messages
    if (socket) {
      socket.on('new_message', (message: Message) => {
        if (message.room_id === chatRoomId) { // Ensure message is for the current chat room
          setMessages(prevMessages => [...prevMessages, message]);
        }
      });
    }

    // Clean up on unmount or when modal closes/room changes
    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [isOpen, chatRoomId, socket, joinOrderChat]); // Re-run effect when modal opens/closes or room changes

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() && user?.id) {
      sendMessage(chatRoomId, newMessage);
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-sm h-full md:max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col transform transition-all duration-300 ease-out sm:scale-95 sm:opacity-0 sm:pointer-events-none data-[open=true]:scale-100 data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto" data-open={isOpen}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-medium">
                {recipientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{recipientName}</h3>
              {/* <p className="text-sm text-green-600">Online</p> */}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200" title="Call">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200" title="Video Call">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200" title="More Options">
              <MoreVertical className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200" title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: 'calc(100% - 140px)' }}> {/* Adjust max-height based on header/footer */} 
          {messages.length > 0 ? messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl shadow-sm ${message.sender_id === user?.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                  }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-1 text-right ${message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}
                >
                  {message.sender_id === user?.id ? 'You' : message.sender_name} • {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          )) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Start your conversation with {recipientName}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200" title="Attach File">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200" title="Emoji">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}