import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  MessageCircle,
  Filter,
  Search,
  Calendar,
  Download,
  Plus,
  RefreshCw,
  AlertCircle,
  CreditCard,
  LogOut
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/auth.slice'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  supplier: {
    id: string
    name: string
    businessName: string
    location: string
    phone: string
  }
  items: {
    id: string
    name: string
    quantity: number
    unit: string
    price: number
    total: number
  }[]
  status: 'pending' | 'accepted' | 'in_progress' | 'out_for_delivery' | 'delivered' | 'cancelled'
  orderType: 'one-time' | 'recurring'
  totalAmount: number
  orderDate: Date
  expectedDelivery?: Date
  actualDelivery?: Date
  notes?: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentMethod: 'upi' | 'invoice'
  recurringFrequency?: 'weekly' | 'monthly'
  nextRecurringDate?: Date
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function VendorOrdersPage() {
  const location = useLocation()
  const { user } = useAppSelector((state: any) => state.auth)
  const dispatch = useAppDispatch()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  const handleLogout = () => {
    dispatch(logout())
  }

  useEffect(() => {
    // Initialize with mock orders
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        supplier: {
          id: 'sup-1',
          name: 'Rajesh Kumar',
          businessName: 'Fresh Vegetables Co.',
          location: 'Andheri, Mumbai',
          phone: '+91 98765 43210'
        },
        items: [
          { id: '1', name: 'Tomatoes', quantity: 10, unit: 'kg', price: 40, total: 400 },
          { id: '2', name: 'Onions', quantity: 5, unit: 'kg', price: 30, total: 150 }
        ],
        status: 'delivered',
        orderType: 'one-time',
        totalAmount: 550,
        orderDate: new Date('2024-01-15T10:30:00'),
        expectedDelivery: new Date('2024-01-15T14:00:00'),
        actualDelivery: new Date('2024-01-15T13:45:00'),
        paymentStatus: 'paid',
        paymentMethod: 'upi'
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        supplier: {
          id: 'sup-2',
          name: 'Priya Sharma',
          businessName: 'Spice Masters',
          location: 'Crawford Market, Mumbai',
          phone: '+91 87654 32109'
        },
        items: [
          { id: '3', name: 'Red Chili Powder', quantity: 2, unit: 'kg', price: 200, total: 400 }
        ],
        status: 'out_for_delivery',
        orderType: 'recurring',
        totalAmount: 400,
        orderDate: new Date('2024-01-16T09:15:00'),
        expectedDelivery: new Date('2024-01-16T15:00:00'),
        paymentStatus: 'pending',
        paymentMethod: 'invoice',
        recurringFrequency: 'monthly',
        nextRecurringDate: new Date('2024-02-16T09:15:00')
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        supplier: {
          id: 'sup-1',
          name: 'Rajesh Kumar',
          businessName: 'Fresh Vegetables Co.',
          location: 'Andheri, Mumbai',
          phone: '+91 98765 43210'
        },
        items: [
          { id: '5', name: 'Potatoes', quantity: 15, unit: 'kg', price: 25, total: 375 }
        ],
        status: 'pending',
        orderType: 'one-time',
        totalAmount: 375,
        orderDate: new Date('2024-01-17T11:00:00'),
        expectedDelivery: new Date('2024-01-17T16:00:00'),
        paymentStatus: 'pending',
        paymentMethod: 'upi'
      }
    ]

    // Check if there's a new order from checkout
    if (location.state?.newOrder) {
      const newOrder = {
        ...location.state.newOrder,
        supplier: {
          id: 'sup-1',
          name: 'Supplier Name',
          businessName: location.state.newOrder.supplier,
          location: 'Mumbai',
          phone: '+91 98765 43210'
        },
        items: [
          { id: '1', name: 'Sample Product', quantity: 1, unit: 'kg', price: location.state.newOrder.total, total: location.state.newOrder.total }
        ],
        orderDate: new Date(),
        paymentMethod: 'upi' as const,
        paymentStatus: 'pending' as const
      }
      setOrders([newOrder, ...mockOrders])
      toast.success('Order placed successfully!')
    } else {
      setOrders(mockOrders)
    }
  }, [location.state])

  const statusOptions = ['all', 'pending', 'accepted', 'in_progress', 'out_for_delivery', 'delivered', 'cancelled']

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Package className="w-4 h-4" />
      case 'out_for_delivery': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handlePayNow = (orderId: string) => {
    // Simulate payment
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, paymentStatus: 'paid' as const }
        : order
    ))
    toast.success('Payment completed successfully!')
  }

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'cancelled' as const }
        : order
    ))
    toast.success('Order cancelled successfully!')
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
                <Package className="w-6 h-6 mr-2" />
                <span className="text-xl font-semibold">My Orders</span>
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
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">Track your orders and delivery status</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn btn-outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <Link to="/vendor/home" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : getStatusLabel(status)}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </button>
                <button className="btn btn-outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusLabel(order.status)}</span>
                      </span>
                      {order.orderType === 'recurring' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Recurring
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Supplier:</strong> {order.supplier.businessName}</p>
                      <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                      {order.expectedDelivery && (
                        <p><strong>Expected Delivery:</strong> {formatDate(order.expectedDelivery)}</p>
                      )}
                      {order.nextRecurringDate && (
                        <p><strong>Next Order:</strong> {formatDate(order.nextRecurringDate)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      via {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.name} ({item.quantity} {item.unit})</span>
                        <span className="font-medium">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-outline text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    <button className="btn btn-outline text-sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="btn btn-outline text-sm text-red-600 hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.status === 'delivered' && order.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handlePayNow(order.id)}
                        className="btn btn-primary text-sm"
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Pay Now
                      </button>
                    )}

                    {order.orderType === 'recurring' && (
                      <button className="btn btn-outline text-sm">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Manage Recurring
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You haven\'t placed any orders yet'
              }
            </p>
            <Link to="/vendor/home" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Place Your First Order
            </Link>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedOrder(null)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
                    <p><strong>Status:</strong>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </p>
                    <p><strong>Type:</strong> {selectedOrder.orderType === 'recurring' ? 'Recurring' : 'One-time'}</p>
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                    {selectedOrder.expectedDelivery && (
                      <p><strong>Expected Delivery:</strong> {formatDate(selectedOrder.expectedDelivery)}</p>
                    )}
                    {selectedOrder.actualDelivery && (
                      <p><strong>Actual Delivery:</strong> {formatDate(selectedOrder.actualDelivery)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Supplier Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Business:</strong> {selectedOrder.supplier.businessName}</p>
                    <p><strong>Contact:</strong> {selectedOrder.supplier.name}</p>
                    <p><strong>Location:</strong> {selectedOrder.supplier.location}</p>
                    <p><strong>Phone:</strong> {selectedOrder.supplier.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Items Ordered</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                  <p className={`text-sm ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    Payment Status: {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment Method: {selectedOrder.paymentMethod.toUpperCase()}
                  </p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {selectedOrder.orderType === 'recurring' && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Recurring Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Frequency:</strong> {selectedOrder.recurringFrequency}</p>
                      {selectedOrder.nextRecurringDate && (
                        <p><strong>Next Order:</strong> {formatDate(selectedOrder.nextRecurringDate)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}