import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { Navigation } from '../../components/common'
import { useAppSelector } from '../../hooks/redux'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    growth: number
  }
  orders: {
    current: number
    previous: number
    growth: number
  }
  customers: {
    current: number
    previous: number
    growth: number
  }
  avgOrderValue: {
    current: number
    previous: number
    growth: number
  }
}

interface ChartData {
  name: string
  value: number
  color?: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export default function AnalyticsPage() {
  const { user } = useAppSelector((state: any) => state.auth)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedChart, setSelectedChart] = useState('revenue')

  // Mock analytics data - replace with actual API calls
  const analyticsData: AnalyticsData = {
    revenue: {
      current: user?.role === 'vendor' ? 45000 : 125000,
      previous: user?.role === 'vendor' ? 38000 : 108000,
      growth: user?.role === 'vendor' ? 18.4 : 15.7
    },
    orders: {
      current: user?.role === 'vendor' ? 24 : 89,
      previous: user?.role === 'vendor' ? 19 : 76,
      growth: user?.role === 'vendor' ? 26.3 : 17.1
    },
    customers: {
      current: user?.role === 'vendor' ? 8 : 34,
      previous: user?.role === 'vendor' ? 6 : 28,
      growth: user?.role === 'vendor' ? 33.3 : 21.4
    },
    avgOrderValue: {
      current: user?.role === 'vendor' ? 1875 : 1404,
      previous: user?.role === 'vendor' ? 2000 : 1421,
      growth: user?.role === 'vendor' ? -6.25 : -1.2
    }
  }

  // Mock chart data
  const revenueChartData: ChartData[] = [
    { name: 'Week 1', value: user?.role === 'vendor' ? 8000 : 25000 },
    { name: 'Week 2', value: user?.role === 'vendor' ? 12000 : 32000 },
    { name: 'Week 3', value: user?.role === 'vendor' ? 10000 : 28000 },
    { name: 'Week 4', value: user?.role === 'vendor' ? 15000 : 40000 }
  ]

  const categoryData: ChartData[] = user?.role === 'vendor' ? [
    { name: 'Vegetables', value: 45, color: '#10b981' },
    { name: 'Spices', value: 30, color: '#f59e0b' },
    { name: 'Grains', value: 15, color: '#3b82f6' },
    { name: 'Others', value: 10, color: '#8b5cf6' }
  ] : [
    { name: 'Street Vendors', value: 60, color: '#10b981' },
    { name: 'Small Restaurants', value: 25, color: '#f59e0b' },
    { name: 'Food Trucks', value: 10, color: '#3b82f6' },
    { name: 'Others', value: 5, color: '#8b5cf6' }
  ]

  const topProducts = user?.role === 'vendor' ? [
    { name: 'Fresh Tomatoes', orders: 8, revenue: 3200 },
    { name: 'Red Chili Powder', orders: 6, revenue: 2400 },
    { name: 'Onions', orders: 5, revenue: 1500 },
    { name: 'Basmati Rice', orders: 3, revenue: 2400 },
    { name: 'Turmeric Powder', orders: 2, revenue: 600 }
  ] : [
    { name: 'Fresh Tomatoes', orders: 25, revenue: 15000 },
    { name: 'Onions', orders: 20, revenue: 12000 },
    { name: 'Red Chili Powder', orders: 18, revenue: 14400 },
    { name: 'Potatoes', orders: 15, revenue: 9000 },
    { name: 'Basmati Rice', orders: 12, revenue: 18000 }
  ]

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ]

  const StatCard = ({ title, current, previous, growth, icon: Icon, format = 'number' }: {
    title: string
    current: number
    previous: number
    growth: number
    icon: any
    format?: 'number' | 'currency'
  }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {format === 'currency' ? formatCurrency(current) : current.toLocaleString()}
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {growth >= 0 ? (
          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
        )}
        <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercentage(growth)}
        </span>
        <span className="text-sm text-gray-600 ml-1">vs last period</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={user?.role} />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                {user?.role === 'vendor'
                  ? 'Track your spending and order patterns'
                  : 'Monitor your business performance and growth'
                }
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <button className="btn btn-outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={user?.role === 'vendor' ? 'Total Spent' : 'Total Revenue'}
            current={analyticsData.revenue.current}
            previous={analyticsData.revenue.previous}
            growth={analyticsData.revenue.growth}
            icon={DollarSign}
            format="currency"
          />
          <StatCard
            title={user?.role === 'vendor' ? 'Orders Placed' : 'Orders Received'}
            current={analyticsData.orders.current}
            previous={analyticsData.orders.previous}
            growth={analyticsData.orders.growth}
            icon={ShoppingCart}
          />
          <StatCard
            title={user?.role === 'vendor' ? 'Suppliers' : 'Customers'}
            current={analyticsData.customers.current}
            previous={analyticsData.customers.previous}
            growth={analyticsData.customers.growth}
            icon={Users}
          />
          <StatCard
            title="Avg Order Value"
            current={analyticsData.avgOrderValue.current}
            previous={analyticsData.avgOrderValue.previous}
            growth={analyticsData.avgOrderValue.growth}
            icon={TrendingUp}
            format="currency"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue/Spending Chart */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.role === 'vendor' ? 'Spending Trend' : 'Revenue Trend'}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedChart('revenue')}
                    className={`btn text-sm ${selectedChart === 'revenue' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Chart
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {revenueChartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(item.value / Math.max(...revenueChartData.map(d => d.value))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-16 text-right">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.role === 'vendor' ? 'Spending by Category' : 'Revenue by Customer Type'}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {item.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products/Items */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'vendor' ? 'Most Ordered Items' : 'Top Selling Products'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user?.role === 'vendor' ? 'Total Spent' : 'Revenue'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg per Order
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={product.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">Rank #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.orders}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.revenue / product.orders)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    action: user?.role === 'vendor' ? 'Placed order' : 'Received order',
                    details: user?.role === 'vendor' ? 'ORD-2024-003 from Fresh Vegetables Co.' : 'ORD-2024-003 from Street Delights',
                    time: '2 hours ago',
                    icon: ShoppingCart,
                    color: 'text-blue-600 bg-blue-100'
                  },
                  {
                    action: user?.role === 'vendor' ? 'Payment completed' : 'Payment received',
                    details: formatCurrency(2500) + ' for order ORD-2024-002',
                    time: '5 hours ago',
                    icon: DollarSign,
                    color: 'text-green-600 bg-green-100'
                  },
                  {
                    action: user?.role === 'vendor' ? 'Order delivered' : 'Order completed',
                    details: 'ORD-2024-001 successfully delivered',
                    time: '1 day ago',
                    icon: Package,
                    color: 'text-purple-600 bg-purple-100'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}