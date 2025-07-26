import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product, ProductCategory } from '@vendor-supplier/shared'

interface ProductState {
  products: Product[]
  categories: ProductCategory[]
  selectedCategory: string | null
  searchQuery: string
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
    },
    setCategories: (state, action: PayloadAction<ProductCategory[]>) => {
      state.categories = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload)
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(product => product.id === action.payload.id)
      if (index !== -1) {
        state.products[index] = action.payload
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(product => product.id !== action.payload)
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
  setProducts,
  setCategories,
  setSelectedCategory,
  setSearchQuery,
  addProduct,
  updateProduct,
  removeProduct,
  setLoading,
  setError,
} = productSlice.actions

export default productSlice.reducer