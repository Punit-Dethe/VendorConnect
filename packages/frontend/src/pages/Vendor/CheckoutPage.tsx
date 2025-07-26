import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  Smartphone,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Package,
  Truck
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/auth.slice'
import toast from 'react-hot-toast'

interface CartItem {
  product: {
    id: string
    name: string
    price: number
    unit: string
  }
  quantity: number
}

interface Supplier {
  id: string
  name: string
  businessName: string
  trustScore: number
  location: string
  deliveryTime: string
  phone: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state: any) => state.auth)
  const dispatch = useAppDispatch()

  const { cart, supplier } = location.state || { cart: [], supplier: null }

  const [orderType, setOrderType] = useState<'one-time' | 'recurring'>('one-time')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'invoice'>('upi')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly'>('monthly')

  const handleLogout = () => {
    dispatch(logout())
  }

  useEffect(() => {
    if (!cart || cart.length === 0 || !supplier) {
      navigate('/vendor/home')
    }
  }, [cart, supplier, navigate])

  if (!cart || !supplier) {
    return null
  }

  const subtotal = cart.reduce((total: number, item: CartItem) =>
    total + (item.product.price * item.quantity), 0
  )

  const deliveryFee = subtotal > 1000 ? 0 : 50 // Free delivery above ₹1000
  const gst = subtotal * 0.05 // 5% GST
  const total = subtotal + deliveryFee + gst

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create order object
      const orderData = {
        supplierId: supplier.id,
        items: cart.map((item: CartItem) => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        orderType,
        paymentMethod,
        deliveryDate,
        notes,
        recurringFrequency: orderType === 'recurring' ? recurringFrequency : undefined,
        subtotal,
        deliveryFee,
        gst,
        total
      }

      console.log('Order placed:', orderData)

      toast.success('Order placed successfully!')
      navigate('/vendor/orders', {
        state: {
          newOrder: {
            id: 'ORD-' + Date.now(),
            supplier: supplier.businessName,
            total,
            status: 'pending',
            orderType
          }
        }
      })

    } catch (error) {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getMinDeliveryDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to={`/vendor/supplier/${supplier.id}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Products
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete the purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Info */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Details</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{supplier.businessName}</h3>
                    <p className="text-sm text-gray-600">by {supplier.name}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
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
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Trust: {supplier.trustScore}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Type Selection */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      value="one-time"
                      checked={orderType === 'one-time'}
                      onChange={(e) => setOrderType(e.target.value as 'one-time')}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${orderType === 'one-time'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <Package className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">One-time Order</div>
                          <div className="text-sm text-gray-500">Single delivery</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      value="recurring"
                      checked={orderType === 'recurring'}
                      onChange={(e) => setOrderType(e.target.value as 'recurring')}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${orderType === 'recurring'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">Recurring Order</div>
                          <div className="text-sm text-gray-500">Regular deliveries</div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {orderType === 'recurring' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value as 'weekly' | 'monthly')}
                      className="input"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={getMinDeliveryDate()}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <div className="input bg-gray-50">
                      {user?.location?.address}, {user?.location?.city}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements or delivery instructions..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'upi'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">UPI Payment</div>
                          <div className="text-sm text-gray-500">Pay instantly via UPI</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      value="invoice"
                      checked={paymentMethod === 'invoice'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'invoice')}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'invoice'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">Invoice Upload</div>
                          <div className="text-sm text-gray-500">Pay later with invoice</div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'invoice' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Payment Terms</p>
                        <p className="text-sm text-yellow-700">
                          Payment must be completed within 7 days of delivery. Late payments may affect your trust score.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {cart.map((item: CartItem) => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.product.unit} × {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (5%):</span>
                    <span>{formatCurrency(gst)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {subtotal < 1000 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Add {formatCurrency(1000 - subtotal)} more for free delivery!
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Expected delivery: {supplier.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Secure payment & delivery guarantee</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !deliveryDate}
                  className="w-full btn btn-primary mt-6 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </button>

                {orderType === 'recurring' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You'll receive reminders 3 days before each recurring order
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}