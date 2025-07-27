import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authSlice from './slices/auth.slice'
import orderSlice from './slices/order.slice'
import productSlice from './slices/product.slice'
import chatSlice from './slices/chat.slice'
import notificationSlice from './slices/notification.slice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    orders: orderSlice,
    products: productSlice,
    chat: chatSlice,
    notifications: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector