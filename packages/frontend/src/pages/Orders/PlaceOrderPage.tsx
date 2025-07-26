import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Truck
} from 'lucide-react'
import { Navigation } from '../../components/common'

interface Supplier {
  id: string
  name: string
  trustScore: number
  location: string
  deliveryTime: string
  rating: number
  totalOrders: number
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  unit: string
  supplier: Supplier
  image?: string
  minOrder: number
  available: boolean
}

interface CartItem {
  product: Product
  quantity: number
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export default function PlaceOrderPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  // Mock data - replace with actual API calls
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Fresh Vegetables Co.',
      trustScore: 85,
      location: 'Andheri, Mumbai',
      deliveryTime: '2-4 hours',
      rating: 4.5,
      totalOrders: 150
    },
    {
      id: '2',
      name: 'Spice Masters',
      trustScore: 92,
      location: 'Crawford Market, Mumbai',
      deliveryTime: '1-3 hours',
      rating: 4.8,
      totalOrders: 200
    }
  ]

  const products: Product[] = [
    {
      id: '1',
      name: 'Fresh Tomatoes',
      category: 'Vegetables',
      price: 40,
      unit: 'kg',
      supplier: suppliers[0],
      minOrder: 5,
      available: true
    },
    {
      id: '2',
      name: 'Red Onions',
      category: 'Vegetables',
      price: 30,
      unit: 'kg',
      supplier: suppliers[0],
      minOrder: 5,
      available: true
    },
    {
      id: '3',
      name: 'Red Chili Powder',
      category: 'Spices',
      price: 200,
      unit: 'kg',
      supplier: suppliers[1],
      minOrder: 1,
      available: true
    },
    {
      id: '4',
      name: 'Turmeric Powder',
      category: 'Spices',
      price: 150,
      unit: 'kg',
      supplier: suppliers[1],
      minOrder: 1,
      available: true
    }
  ]

  const categories = ['all', 'Vegetables', 'Spices', 'Grains', 'Dairy', 'Oils']

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.available
  })

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: product.minOrder }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const isInCart = (productId: string) => {
    return cart.some(item => item.product.id === productId)
  }

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="vendor" />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Place Order</h1>
              <p className="text-gray-600">Browse products from trusted suppliers</p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="btn btn-primary relative"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({getCartItemCount()})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card">
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(product.price)}/{product.unit}
                    </span>
                    <span className="text-sm text-gray-500">
                      Min: {product.minOrder} {product.unit}
                    </span>
                  </div>
                </div>

                {/* Supplier Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{product.supplier.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{product.supplier.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {product.supplier.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {product.supplier.deliveryTime}
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-3 h-3 mr-1" />
                      Trust Score: {product.supplier.trustScore}/100
                    </div>
                  </div>
                </div>

                {/* Add to Cart */}
                {isInCart(product.id) ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(product.id, getCartQuantity(product.id) - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium">{getCartQuantity(product.id)} {product.unit}</span>
                      <button
                        onClick={() => updateQuantity(product.id, getCartQuantity(product.id) + 1)}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(product.price * getCartQuantity(product.id))}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Your Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <button
                            onClick={() => updateQuantity(item.product.id, 0)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.product.supplier.name}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span>{item.quantity} {item.product.unit}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                  <button className="w-full btn btn-primary">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}