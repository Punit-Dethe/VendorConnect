import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Order } from '@vendor-supplier/shared'

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload)
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id)
      if (index !== -1) {
        state.orders[index] = action.payload
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload
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
  setOrders,
  setCurrentOrder,
  addOrder,
  updateOrder,
  setLoading,
  setError,
} = orderSlice.actions

export default orderSlice.reducer