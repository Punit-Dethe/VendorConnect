import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatRoom, ChatMessage } from '@vendor-supplier/shared'

interface ChatState {
  rooms: ChatRoom[]
  currentRoom: ChatRoom | null
  messages: { [roomId: string]: ChatMessage[] }
  isLoading: boolean
  error: string | null
}

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: {},
  isLoading: false,
  error: null,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.rooms = action.payload
    },
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload
    },
    setMessages: (state, action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>) => {
      state.messages[action.payload.roomId] = action.payload.messages
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const roomId = action.payload.roomId
      if (!state.messages[roomId]) {
        state.messages[roomId] = []
      }
      state.messages[roomId].push(action.payload)
    },
    markMessageAsRead: (state, action: PayloadAction<{ roomId: string; messageId: string }>) => {
      const { roomId, messageId } = action.payload
      const messages = state.messages[roomId]
      if (messages) {
        const message = messages.find(m => m.id === messageId)
        if (message) {
          message.isRead = true
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setRooms,
  setCurrentRoom,
  setMessages,
  addMessage,
  markMessageAsRead,
  setLoading,
  setError,
} = chatSlice.actions

export default chatSlice.reducer