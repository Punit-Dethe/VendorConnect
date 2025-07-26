import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  Plus
} from 'lucide-react'
import { Navigation } from '../../components/common'
import { useAppSelector } from '../../hooks/redux'

interface Order {
  id: string
  orderNumber: string
  supplier: {
    id: string
    name: string
    businessName: string
    location: string
  }
  vendor?: {
    id: string
    name: string
    businessName: string
    location: string
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
  totalAmount: number
  orderDate: Date
  expectedDelivery?: Date
  actualDelivery?: Date
  notes?: string
  paymentStatus: 'pending' | 'paid' | 'failed'
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

export default function OrdersPage() {
  const { user } = useAppSelector((state: any) => state.auth)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Mock data - replace with actual API calls
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      supplier: {
        id: 'sup-1',
        name: 'Rajesh Kumar',
        businessName: 'Fresh Vegetables Co.',
        location: 'Andheri, Mumbai'
      },
      vendor: user?.role === 'supplier' ? {
        id: 'ven-1',
        name: 'Amit Sharma',
        businessName: 'Street Delights',
        location: 'Bandra, Mumbai'
      } : undefined,
      items: [
        { id: '1', name: 'Tomatoes', quantity: 10, unit: 'kg', price: 40, total: 400 },
        { id: '2', name: 'Onions', quantity: 5, unit: 'kg', price: 30, total: 150 }
      ],
      status: 'delivered',
      totalAmount: 550,
      orderDate: new Date('2024-01-15T10:30:00'),
      expectedDelivery: new Date('2024-01-15T14:00:00'),
      actualDelivery: new Date('2024-01-15T13:45:00'),
      paymentStatus: 'paid'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      supplier: {
        id: 'sup-2',
        name: 'Priya Sharma',
        businessName: 'Spice Masters',
        location: 'Crawford Market, Mumbai'
      },
      vendor: user?.role === 'supplier' ? {
        id: 'ven-2',
        name: 'Ravi Patel',
        businessName: 'Mumbai Chaat',
        location: 'Juhu, Mumbai'
      } : undefined,
      items: [
        { id: '3', name: 'Red Chili Powder', quantity: 2, unit: 'kg', price: 200, total: 400 },
        { id: '4', name: 'Turmeric Powder', quantity: 1, unit: 'kg', price: 150, total: 150 }
      ],
      status: 'out_for_delivery',
      totalAmount: 550,
      orderDate: new Date('2024-01-16T09:15:00'),
      expectedDelivery: new Date('2024-01-16T15:00:00'),
      paymentStatus: 'pending'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      supplier: {
        id: 'sup-1',
        name: 'Rajesh Kumar',
        businessName: 'Fresh Vegetables Co.',
        location: 'Andheri, Mumbai'
      },
      vendor: user?.role === 'supplier' ? {
        id: 'ven-3',
        name: 'Sunita Devi',
        businessName: 'Tasty Treats',
        location: 'Malad, Mumbai'
      } : undefined,
      items: [
        { id: '5', name: 'Potatoes', quantity: 15, unit: 'kg', price: 25, total: 375 }
      ],
      status: 'pending',
      totalAmount: 375,
      orderDate: new Date('2024-01-17T11:00:00'),
      expectedDelivery: new Date('2024-01-17T16:00:00'),
      paymentStatus: 'pending'
    }
  ]

  const statusOptions = ['all', 'pending', 'accepted', 'in_progress', 'out_for_delivery', 'delivered', 'cancelled']

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user?.role === 'vendor' ? order.supplier.businessName : order.vendor?.businessName || '')
        .toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={user?.role} />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'vendor' ? 'My Orders' : 'Order Requests'}
              </h1>
              <p className="text-gray-600">
                {user?.role === 'vendor'
                  ? 'Track your orders and delivery status'
                  : 'Manage incoming order requests from vendors'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="btn btn-outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              {user?.role === 'vendor' && (
                <Link to="/vendor/orders/place" className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Link>
              )}
            </div>
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
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>
                          {user?.role === 'vendor' ? 'Supplier:' : 'Vendor:'}
                        </strong>{' '}
                        {user?.role === 'vendor' ? order.supplier.businessName : order.vendor?.businessName}
                      </p>
                      <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                      {order.expectedDelivery && (
                        <p><strong>Expected Delivery:</strong> {formatDate(order.expectedDelivery)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
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

                  {user?.role === 'supplier' && order.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button className="btn btn-outline text-sm text-red-600 hover:bg-red-50">
                        Decline
                      </button>
                      <button className="btn btn-primary text-sm">
                        Accept Order
                      </button>
                    </div>
                  )}

                  {order.status === 'delivered' && order.paymentStatus === 'pending' && (
                    <button className="btn btn-primary text-sm">
                      Pay Now
                    </button>
                  )}
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
                : user?.role === 'vendor'
                  ? 'You haven\'t placed any orders yet'
                  : 'No order requests received yet'
              }
            </p>
            {user?.role === 'vendor' && (
              <Link to="/vendor/orders/place" className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Place Your First Order
              </Link>
            )}
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
                  <h3 className="font-medium text-gray-900 mb-2">
                    {user?.role === 'vendor' ? 'Supplier Details' : 'Vendor Details'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {user?.role === 'vendor' ? (
                      <>
                        <p><strong>Business:</strong> {selectedOrder.supplier.businessName}</p>
                        <p><strong>Contact:</strong> {selectedOrder.supplier.name}</p>
                        <p><strong>Location:</strong> {selectedOrder.supplier.location}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Business:</strong> {selectedOrder.vendor?.businessName}</p>
                        <p><strong>Contact:</strong> {selectedOrder.vendor?.name}</p>
                        <p><strong>Location:</strong> {selectedOrder.vendor?.location}</p>
                      </>
                    )}
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
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedOrder.notes}
                    </p>
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