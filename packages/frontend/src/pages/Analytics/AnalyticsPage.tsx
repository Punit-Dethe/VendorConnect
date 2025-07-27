import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import { Navigation } from '../../components/common'

interface AnalyticsData {
  overview: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    pendingPayments: number;
    trustScore: number;
  };
  orderStats: {
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
    completionRate: number;
  };
  monthlyData: Array<{
    month: string;
    orders: number;
    revenue: number;
    completedOrders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    totalOrdered: number;
    pricePerUnit: number;
    stockQuantity: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    totalStock: number;
    totalValue: number;
  }>;
  stockAlerts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minRequired: number;
    category: string;
  }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/supplier/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation userRole="supplier" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation userRole="supplier" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Start adding products and receiving orders to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="supplier" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your business performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gray-600">Trust Score: </span>
              <span className="font-bold text-lg text-purple-600">{analytics.overview.trustScore}</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.lowStockProducts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Monthly Performance Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
              <div className="space-y-4">
                {analytics.monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{month.month}</p>
                      <p className="text-sm text-gray-600">{month.orders} orders • {month.completedOrders} completed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{month.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {month.orders > 0 ? Math.round((month.completedOrders / month.orders) * 100) : 0}% completion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{analytics.orderStats.pending}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{analytics.orderStats.approved}</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{analytics.orderStats.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{analytics.orderStats.rejected}</p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Completion Rate</span>
                  <span className="font-bold text-lg text-green-600">{analytics.orderStats.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
              <div className="space-y-4">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category} • ₹{product.pricePerUnit}/{product.stockQuantity > 0 ? 'unit' : 'out of stock'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{product.totalOrdered}</p>
                      <p className="text-sm text-gray-500">units ordered</p>
                    </div>
                  </div>
                ))}
                {analytics.topProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p>No product orders yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {analytics.categoryStats.map((category, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900 capitalize">{category.category}</span>
                      <span className="text-sm text-gray-600">{category.count} products</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Stock: {category.totalStock} units</p>
                      <p>Value: ₹{category.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {analytics.categoryStats.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No categories yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
              <div className="space-y-3">
                {analytics.stockAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-red-900">{alert.name}</span>
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-sm text-red-700">
                      <p>Current: {alert.currentStock} • Min: {alert.minRequired}</p>
                      <p className="text-xs text-red-600 capitalize">{alert.category}</p>
                    </div>
                  </div>
                ))}
                {analytics.stockAlerts.length === 0 && (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">All products well stocked!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="/supplier/products" className="w-full btn btn-primary text-left block">
                  <Package className="w-4 h-4 mr-2" />
                  Add New Product
                </a>
                <a href="/supplier/orders" className="w-full btn btn-outline text-left block">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View All Orders
                </a>
                <a href="/supplier/dashboard" className="w-full btn btn-outline text-left block">
                  <Star className="w-4 h-4 mr-2" />
                  Improve Trust Score
                </a>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Pending Payments</span>
                  <span className="font-bold">₹{analytics.overview.pendingPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <span className="font-bold">{analytics.orderStats.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Trust Score</span>
                  <span className="font-bold">{analytics.overview.trustScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}