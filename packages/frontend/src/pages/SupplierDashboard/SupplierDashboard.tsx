
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Star,
  DollarSign,
  Users
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

export default function SupplierDashboard() {
  const { user } = useAppSelector((state: any) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with actual API calls
  const dashboardStats = {
    trustScore: user?.trustScore || 82,
    totalProducts: 45,
    lowStockItems: 8,
    monthlyRevenue: 125000,
    pendingOrders: 12
  }

  const recentOrders = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      vendor: 'Raj\'s Food Cart',
      items: 'Tomatoes (10kg), Onions (5kg)',
      amount: 2500,
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      vendor: 'Street Delights',
      items: 'Red Chili (2kg), Turmeric (1kg)',
      amount: 1800,
      status: 'accepted',
      date: '2024-01-14'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      vendor: 'Mumbai Chaat',
      items: 'Basmati Rice (25kg)',
      amount: 3200,
      status: 'in_progress',
      date: '2024-01-13'
    }
  ]

  const lowStockProducts = [
    { name: 'Tomatoes', currentStock: 15, minStock: 50, unit: 'kg' },
    { name: 'Red Chili Powder', currentStock: 8, minStock: 20, unit: 'kg' },
    { name: 'Basmati Rice', currentStock: 25, minStock: 100, unit: 'kg' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered'
      case 'accepted': return 'Accepted'
      case 'in_progress': return 'In Progress'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="supplier" />

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
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-red-600 mt-2">
              {dashboardStats.lowStockItems} low stock items
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.monthlyRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+18% from last month</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Awaiting your response</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Order Requests</h2>
                  <div className="flex space-x-2">
                    <button className="btn btn-outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
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
                        <p className="text-sm text-gray-600 mt-1">{order.vendor}</p>
                        <p className="text-sm text-gray-500">{order.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                        {order.status === 'pending' && (
                          <div className="flex space-x-2 mt-2">
                            <button className="btn btn-primary text-xs px-3 py-1">Accept</button>
                            <button className="btn btn-outline text-xs px-3 py-1">Decline</button>
                          </div>
                        )}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <Link to="/supplier/products" className="w-full btn btn-primary justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Link>
                  <Link to="/supplier/products" className="w-full btn btn-outline justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Link>
                  <button className="w-full btn btn-outline justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </button>
                  <button className="w-full btn btn-outline justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Find Vendors
                  </button>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Low Stock Alerts</h2>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  {lowStockProducts.map((product, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-red-900">{product.name}</p>
                          <p className="text-sm text-red-700">
                            {product.currentStock} {product.unit} remaining
                          </p>
                        </div>
                        <button className="btn btn-primary text-xs px-2 py-1">
                          Restock
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-red-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${(product.currentStock / product.minStock) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button className="w-full btn btn-outline text-sm">View All Alerts</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}