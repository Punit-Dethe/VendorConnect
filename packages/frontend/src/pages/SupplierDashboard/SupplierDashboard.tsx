
import React, { useState, useEffect } from 'react';
import { Package, BarChart3 } from 'lucide-react';
import { useRealtime } from '../../components/realtime/RealtimeProvider';
import OrderApprovalModal from '../../components/orders/OrderApprovalModal';
import { Navigation } from '../../components/common';

const SupplierDashboard: React.FC = () => {
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
      const response = await fetch('http://localhost:5000/api/supplier/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/supplier/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Supplier Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's your business overview.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="card-content py-3 px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-700">Trust Score</span>
                  <span className="font-bold text-xl text-purple-900">
                    {dashboardData?.trustScore || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = '/supplier/products'}
                className="btn btn-outline btn-sm"
              >
                <Package className="w-4 h-4 mr-1" />
                Products
              </button>
              <button
                onClick={() => window.location.href = '/supplier/analytics'}
                className="btn btn-primary btn-sm"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card card-elevated bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {dashboardData?.stats?.totalOrders || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {pendingOrders.length}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {pendingOrders.length > 0 ? 'Needs attention' : 'All caught up'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-green-900">
                    ₹{((dashboardData?.stats?.totalRevenue || 0) / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ₹{dashboardData?.stats?.totalRevenue?.toLocaleString() || 0} total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {dashboardData?.stats?.completedOrders || 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Successful orders</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
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