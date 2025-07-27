
import React, { useState, useEffect } from 'react';
import { Package, BarChart3, TrendingUp, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../components/realtime/RealtimeProvider';
import OrderApprovalModal from '../../components/orders/OrderApprovalModal';
import { Navigation } from '../../components/common';

const SupplierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { notifications } = useRealtime();
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchOrders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping dashboard data fetch');
        return;
      }

      const response = await fetch('http://localhost:5000/api/supplier/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      } else if (response.status !== 401) {
        // Only log non-auth errors to prevent automatic logout
        console.error('Error fetching dashboard data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't logout on network errors
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping orders fetch');
        return;
      }

      const response = await fetch('http://localhost:5000/api/supplier/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(result.data);
      } else if (response.status !== 401) {
        // Only log non-auth errors to prevent automatic logout
        console.error('Error fetching orders:', response.status);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't logout on network errors
    }
  };

  const handleApproveOrder = async (orderData: {
    estimatedDeliveryTime: string;
    paymentTerms: number;
    notes: string;
  }) => {
    if (!selectedOrder) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/supplier/orders/${selectedOrder.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();

        // Update orders list
        setOrders(prev => prev.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: 'approved', ...orderData }
            : order
        ));

        // Close modal
        setIsApprovalModalOpen(false);
        setSelectedOrder(null);

        // Refresh dashboard data
        fetchDashboardData();

        alert('Order approved successfully! Contract has been generated.');
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to approve order');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectOrder = async (reason: string) => {
    if (!selectedOrder) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/supplier/orders/${selectedOrder.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        // Update orders list
        setOrders(prev => prev.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: 'rejected', rejectionReason: reason }
            : order
        ));

        // Close modal
        setIsApprovalModalOpen(false);
        setSelectedOrder(null);

        // Refresh dashboard data
        fetchDashboardData();

        alert('Order rejected successfully!');
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order');
    } finally {
      setIsLoading(false);
    }
  };

  const openApprovalModal = (order: any) => {
    setSelectedOrder(order);
    setIsApprovalModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation userRole="supplier" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
                Supplier Dashboard
              </h1>
              <p className="text-gray-600 text-xl">Welcome back! Here's your business overview.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Trust Score Card */}
              <div className="card card-elevated bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <div className="card-content py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium text-purple-700">Trust Score</p>
                      <p className="font-bold text-2xl text-purple-900">
                        {dashboardData?.trustScore || 85}/100
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/supplier/products')}
                  className="btn btn-outline flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Package className="w-4 h-4" />
                  <span>Manage Products</span>
                </button>
                <button
                  onClick={() => navigate('/supplier/analytics')}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card card-elevated bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300 hover:scale-105 transition-transform duration-300">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-2">Total Orders</p>
                  <p className="text-4xl font-bold text-blue-900 mb-1">
                    {dashboardData?.stats?.totalOrders || 0}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">All time orders</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-amber-300 hover:scale-105 transition-transform duration-300">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-2">Pending Orders</p>
                  <p className="text-4xl font-bold text-amber-900 mb-1">
                    {pendingOrders.length}
                  </p>
                  <p className="text-xs text-amber-600 font-medium">
                    {pendingOrders.length > 0 ? 'Needs attention' : 'All caught up'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 border-emerald-300 hover:scale-105 transition-transform duration-300">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 mb-2">Total Revenue</p>
                  <p className="text-4xl font-bold text-emerald-900 mb-1">
                    ₹{((dashboardData?.stats?.totalRevenue || 0) / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    ₹{dashboardData?.stats?.totalRevenue?.toLocaleString() || 0} earned
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 border-violet-300 hover:scale-105 transition-transform duration-300">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-violet-700 mb-2">Completed</p>
                  <p className="text-4xl font-bold text-violet-900 mb-1">
                    {dashboardData?.stats?.completedOrders || 0}
                  </p>
                  <p className="text-xs text-violet-600 font-medium">Successful orders</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Orders - Priority Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Pending Orders ({pendingOrders.length})
                </h2>
                {pendingOrders.length > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    Action Required
                  </span>
                )}
              </div>

              {pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending orders at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          <p className="text-gray-600">
                            From: <span className="font-medium">{order.vendor?.name}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Trust Score: {order.vendor?.trustScore}/100
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">₹{order.totalAmount}</p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length} items
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items?.slice(0, 3).map((item: any, index: number) => (
                            <span key={index} className="bg-white px-2 py-1 rounded text-sm">
                              {item.productName} ({item.quantity})
                            </span>
                          ))}
                          {order.items?.length > 3 && (
                            <span className="text-sm text-gray-500">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          Ordered: {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <button
                          onClick={() => openApprovalModal(order)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Review Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications & Quick Stats */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Notifications
              </h3>
              {recentNotifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent notifications</p>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Alerts */}
            {dashboardData?.lowStockAlerts?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Low Stock Alerts
                </h3>
                <div className="space-y-2">
                  {dashboardData.lowStockAlerts.map((product: any) => (
                    <div key={product.id} className="p-2 bg-red-50 border border-red-200 rounded">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-red-600">
                        Stock: {product.currentStock} (Min: {product.minRequired})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Orders Table */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <p className="font-medium">{order.vendor?.name}</p>
                        <p className="text-xs text-gray-400">{order.vendor?.businessType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => openApprovalModal(order)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Approval Modal */}
      <OrderApprovalModal
        order={selectedOrder}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedOrder(null);
        }}
        onApprove={handleApproveOrder}
        onReject={handleRejectOrder}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SupplierDashboard;