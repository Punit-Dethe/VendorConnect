import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Clock,
  CreditCard,
  Plus,
  Search,
  Filter,
  Star,
  Package
} from 'lucide-react'
import { useAppSelector } from '../../hooks/redux'
import { Navigation } from '../../components/common'

// Utility functions
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

export default function VendorDashboard() {
  const { user } = useAppSelector((state: any) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with actual API calls
  const dashboardStats = {
    trustScore: user?.trustScore || 75,
    totalOrders: 24,
    pendingOrders: 3,
    totalSpent: 45000,
    upcomingPayments: 8500
  }

  const recentOrders = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      supplier: 'Fresh Vegetables Co.',
      items: 'Tomatoes, Onions, Potatoes',
      amount: 2500,
      status: 'delivered',
      date: '2024-01-15'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      supplier: 'Spice Masters',
      items: 'Red Chili, Turmeric, Coriander',
      amount: 1800,
      status: 'out_for_delivery',
      date: '2024-01-14'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      supplier: 'Grain Suppliers Ltd.',
      items: 'Basmati Rice, Wheat Flour',
      amount: 3200,
      status: 'in_progress',
      date: '2024-01-13'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered'
      case 'out_for_delivery': return 'Out for Delivery'
      case 'in_progress': return 'In Progress'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="vendor" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trust Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatTrustScore(dashboardStats.trustScore)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${dashboardStats.trustScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {dashboardStats.pendingOrders} pending orders
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+12% from last month</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Payments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.upcomingPayments)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Due in next 7 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                  <button className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{order.orderNumber}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{order.supplier}</p>
                        <p className="text-sm text-gray-500">{order.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="w-full btn btn-outline">View All Orders</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <Link to="/vendor/orders/place" className="w-full btn btn-primary justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Place New Order
                  </Link>
                  <button className="w-full btn btn-outline justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Recurring Orders
                  </button>
                  <button className="w-full btn btn-outline justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment History
                  </button>
                  <Link to="/vendor/suppliers" className="w-full btn btn-outline justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Find Suppliers
                  </Link>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Order Update</p>
                    <p className="text-sm text-blue-700">Your order ORD-002 is out for delivery</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">Payment Reminder</p>
                    <p className="text-sm text-yellow-700">Payment due for order ORD-001 in 2 days</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">New Supplier</p>
                    <p className="text-sm text-green-700">Fresh Mart joined your area</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}