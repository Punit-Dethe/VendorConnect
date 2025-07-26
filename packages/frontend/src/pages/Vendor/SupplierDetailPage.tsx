import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Shield,
  Phone,
  MessageCircle,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Truck,
  Award,
  CheckCircle
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/auth.slice'

interface Product {
  id: string
  name: string
  category: string
  price: number
  unit: string
  stock: number
  minOrder: number
  description: string
  image?: string
  available: boolean
}

interface CartItem {
  product: Product
  quantity: number
}

interface Supplier {
  id: string
  name: string
  businessName: string
  trustScore: number
  location: string
  deliveryTime: string
  rating: number
  totalOrders: number
  categories: string[]
  specialties: string[]
  priceRange: 'low' | 'medium' | 'high'
  phone: string
  email: string
  verified: boolean
  joinedDate: string
  description: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatTrustScore = (score: number): string => {
  return `${Math.round(score)}/100`;
};

export default function SupplierDetailPage() {
  const { supplierId } = useParams()
  const { user } = useAppSelector((state: any) => state.auth)
  const dispatch = useAppDispatch()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleLogout = () => {
    dispatch(logout())
  }

  // Mock supplier data - replace with actual API call
  const supplier: Supplier = {
    id: supplierId || '1',
    name: 'Rajesh Kumar',
    businessName: 'Fresh Vegetables Co.',
    trustScore: 92,
    location: 'Andheri, Mumbai',
    deliveryTime: '2-4 hours',
    rating: 4.8,
    totalOrders: 150,
    categories: ['Vegetables', 'Fruits'],
    specialties: ['Organic Vegetables', 'Same Day Delivery', 'Bulk Orders'],
    priceRange: 'medium',
    phone: '+91 98765 43210',
    email: 'rajesh@freshveggies.com',
    verified: true,
    joinedDate: '2019-03-15',
    description: 'Premium quality fresh vegetables and fruits sourced directly from farms. Serving Mumbai vendors for over 5 years with consistent quality and reliable delivery.'
  }

  // Mock products data - replace with actual API call
  const products: Product[] = [
    {
      id: 'prod-1',
      name: 'Fresh Tomatoes',
      category: 'Vegetables',
      price: 40,
      unit: 'kg',
      stock: 150,
      minOrder: 5,
      description: 'Fresh red tomatoes from local farms',
      available: true
    },
    {
      id: 'prod-2',
      name: 'Red Onions',
      category: 'Vegetables',
      price: 30,
      unit: 'kg',
      stock: 200,
      minOrder: 5,
      description: 'Fresh red onions',
      available: true
    },
    {
      id: 'prod-3',
      name: 'Green Capsicum',
      category: 'Vegetables',
      price: 60,
      unit: 'kg',
      stock: 80,
      minOrder: 3,
      description: 'Fresh green capsicum',
      available: true
    },
    {
      id: 'prod-4',
      name: 'Fresh Bananas',
      category: 'Fruits',
      price: 50,
      unit: 'kg',
      stock: 100,
      minOrder: 5,
      description: 'Fresh ripe bananas',
      available: true
    },
    {
      id: 'prod-5',
      name: 'Apples',
      category: 'Fruits',
      price: 120,
      unit: 'kg',
      stock: 60,
      minOrder: 2,
      description: 'Fresh red apples',
      available: true
    }
  ]

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(product =>
    selectedCategory === 'all' || product.category === selectedCategory
  )

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

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrustScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-blue-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/vendor/home"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Suppliers
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.businessType}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supplier Info Section */}
        <div className="card mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{supplier.businessName}</h1>
                      {supplier.verified && (
                        <Award className="w-6 h-6 text-blue-600" title="Verified Supplier" />
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-2">by {supplier.name}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {supplier.rating} ({supplier.totalOrders} orders)
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {supplier.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {supplier.deliveryTime}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-lg font-semibold ${getTrustScoreBg(supplier.trustScore)} ${getTrustScoreColor(supplier.trustScore)}`}>
                    <Shield className="w-5 h-5 inline mr-2" />
                    Trust: {formatTrustScore(supplier.trustScore)}
                  </div>
                </div>

                <p className="text-gray-700 mb-6">{supplier.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="font-semibold">{supplier.categories.join(', ')}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Delivery Time</p>
                    <p className="font-semibold">{supplier.deliveryTime}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="font-semibold">{supplier.totalOrders}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Specialties:</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.specialties.map((specialty) => (
                      <span key={specialty} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="btn btn-outline flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Supplier
                  </button>
                  <button className="btn btn-outline flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
              <div className="flex items-center space-x-4">
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                        <p className="text-sm text-gray-500 mb-3">{product.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(product.price)}/{product.unit}
                          </span>
                          <span className="text-sm text-gray-500">
                            Min: {product.minOrder} {product.unit}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          Stock: {product.stock} {product.unit} available
                        </div>
                      </div>
                    </div>

                    {isInCart(product.id) ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(product.id, Math.max(0, getCartQuantity(product.id) - 1))}
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
                        disabled={!product.available}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          {cart.length > 0 && (
            <div className="lg:w-96">
              <div className="card sticky top-8">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Your Order ({getCartItemCount()} items)
                  </h3>

                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.product.price)}/{item.product.unit}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right ml-4">
                          <span className="font-semibold">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(getTotalAmount())}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Delivery: {supplier.deliveryTime}
                    </p>
                  </div>

                  <Link
                    to={`/vendor/checkout?supplierId=${supplier.id}`}
                    state={{ cart, supplier }}
                    className="w-full btn btn-primary"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}