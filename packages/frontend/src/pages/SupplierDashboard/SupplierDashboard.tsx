
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppSelector } from '../../store';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  Clock,
  Check,
  X,
  Search,
  Filter,
  Star,
  Users,
  DollarSign,
  ShoppingCart,
  Bell,
  MessageCircle,
  FileText,
  CreditCard,
  User,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../services/api';

interface Product {
  id: string;
  supplier_id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price_per_unit: number;
  stock_quantity: number;
  min_order_quantity: number;
  is_available: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  orderNumber: string;
  vendorName: string;
  vendorMobile: string;
  vendorId: string;
  supplierId: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    total_price: number;
  }>;
  totalAmount: number;
  status: string;
  orderType: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  estimatedDeliveryTime?: string;
  notes?: string;
  createdAt: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

interface LowStockAlert {
  id: string;
  name: string;
  currentStock: number;
  minRequired: number;
}

const SupplierDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [trustScore, setTrustScore] = useState(50);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'vegetables',
    unit: 'kg',
    price_per_unit: '',
    stock_quantity: '',
    min_order_quantity: '',
    images: [] as string[]
  });

  const categories = ['vegetables', 'grains', 'spices', 'dairy', 'oils', 'pulses', 'meat', 'seafood'];
  const units = ['kg', 'gram', 'liter', 'piece', 'dozen', 'bundle', 'packet'];

  useEffect(() => {
    loadDashboardData();
    loadProducts();
    loadOrders();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/api/supplier/dashboard');
      const data = response.data.data;
      setStats(data.stats);
      setTrustScore(data.trustScore);
      setLowStockAlerts(data.lowStockAlerts || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/supplier/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await api.get('/api/supplier/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: 'vegetables',
      unit: 'kg',
      price_per_unit: '',
      stock_quantity: '',
      min_order_quantity: '',
      images: []
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/supplier/products', productForm);
      loadProducts();
      loadDashboardData();
      setShowAddProduct(false);
      resetProductForm();
    } catch (error: any) {
      console.error('Failed to add product:', error);
      alert(error.response?.data?.error?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setLoading(true);
      await api.put(`/api/supplier/products/${selectedProduct.id}`, productForm);
      loadProducts();
      loadDashboardData();
      setShowEditProduct(false);
      setSelectedProduct(null);
      resetProductForm();
    } catch (error: any) {
      console.error('Failed to update product:', error);
      alert(error.response?.data?.error?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/supplier/products/${productId}`);
      loadProducts();
      loadDashboardData();
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      alert(error.response?.data?.error?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string, estimatedDeliveryTime: string, paymentTerms: string, notes: string) => {
    try {
      setLoading(true);
      await api.post(`/api/supplier/orders/${orderId}/approve`, {
        estimatedDeliveryTime,
        paymentTerms,
        notes
      });
      loadOrders();
      loadDashboardData();
      setShowOrderModal(false);
      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Failed to approve order:', error);
      alert(error.response?.data?.error?.message || 'Failed to approve order');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      setLoading(true);
      await api.post(`/api/supplier/orders/${orderId}/reject`, { reason });
      loadOrders();
      loadDashboardData();
      setShowOrderModal(false);
      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Failed to reject order:', error);
      alert(error.response?.data?.error?.message || 'Failed to reject order');
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      price_per_unit: product.price_per_unit.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_order_quantity: product.min_order_quantity.toString(),
      images: product.images || []
    });
    setShowEditProduct(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'out_for_delivery': return 'text-orange-600 bg-orange-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const supplierDashboardNavItems = [
    { to: '#dashboard', label: 'Dashboard', icon: TrendingUp },
    { to: '#products', label: 'Products', icon: Package },
    { to: '#orders', label: 'Orders', icon: ShoppingCart },
    { to: '#analytics', label: 'Analytics', icon: TrendingUp },
    { to: '#notifications', label: 'Notifications', icon: Bell },
    { to: '#chat', label: 'Messages', icon: MessageCircle },
    { to: '#contracts', label: 'Contracts', icon: FileText },
    { to: '#payments', label: 'Payments', icon: CreditCard },
    { to: '#profile', label: 'Profile', icon: User }
  ];

  const isActive = (path: string) => {
    const hash = path.substring(1);
    return activeTab === hash;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium text-green-700">Trust Score: {trustScore}/100</span>
              </div>
              
              {lowStockAlerts.length > 0 && (
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">{lowStockAlerts.length} Low Stock</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {supplierDashboardNavItems.map((item) => (
              <button
                key={item.to}
                onClick={() => setActiveTab(item.to.substring(1))}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  isActive(item.to)
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
          <div>
                    <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-red-600 flex items-center">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    Low Stock Alerts
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockAlerts.map((alert) => (
                      <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-medium text-red-900">{alert.name}</h3>
                        <p className="text-red-700 text-sm">
                          Current: {alert.currentStock} | Min Required: {alert.minRequired}
                        </p>
              <button
                          onClick={() => {
                            const product = products.find(p => p.id === alert.id);
                            if (product) editProduct(product);
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Restock Now →
              </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
              </div>
              <div className="p-6">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <h3 className="font-medium">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">{order.vendorName}</p>
                      <p className="text-sm text-gray-500">₹{order.totalAmount}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Product Management</h2>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setShowAddProduct(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Product</span>
                  </button>
          </div>
        </div>

              <div className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-16 w-16" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <div className="flex items-center space-x-1">
                              {product.stock_quantity <= product.min_order_quantity && (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-indigo-600">₹{product.price_per_unit}</span>
                            <span className="text-gray-500">/{product.unit}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Stock: {product.stock_quantity} {product.unit}</div>
                            <div>Min Order: {product.min_order_quantity} {product.unit}</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.is_available 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-red-600 bg-red-100'
                            }`}>
                              {product.is_available ? 'Available' : 'Unavailable'}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">{product.category}</span>
        </div>

                          <div className="flex items-center space-x-2 pt-2">
                            <button
                              onClick={() => editProduct(product)}
                              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Order Management</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{order.orderNumber}</h3>
                        <p className="text-gray-600">Vendor: {order.vendorName}</p>
                        <p className="text-gray-600">Mobile: {order.vendorMobile}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-1">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Order Items:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.product_name} - {item.quantity} {item.unit} × ₹{item.price_per_unit} = ₹{item.total_price}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Delivery Details:</h4>
                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        <p className="text-sm text-gray-600">{order.deliveryCity}, {order.deliveryPincode}</p>
                        {order.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      
                      {order.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Review Order</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Orders from vendors will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {!['dashboard', 'products', 'orders'].includes(activeTab) && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Add New Product</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price_per_unit}
                    onChange={(e) => setProductForm({...productForm, price_per_unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.min_order_quantity}
                    onChange={(e) => setProductForm({...productForm, min_order_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
                </div>
              </div>
            )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Product</h2>
                <button
                  onClick={() => setShowEditProduct(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price_per_unit}
                    onChange={(e) => setProductForm({...productForm, price_per_unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.min_order_quantity}
                    onChange={(e) => setProductForm({...productForm, min_order_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProduct(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Review Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Review Order: {selectedOrder.orderNumber}</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Vendor Details:</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.vendorName}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.vendorMobile}</p>
        </div>

                <div>
                  <h3 className="font-medium mb-2">Order Details:</h3>
                  <p className="text-sm text-gray-600">Total: ₹{selectedOrder.totalAmount}</p>
                  <p className="text-sm text-gray-600">Type: {selectedOrder.orderType}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>
                      {item.product_name} - {item.quantity} {item.unit} × ₹{item.price_per_unit} = ₹{item.total_price}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Delivery Address:</h3>
                <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
                <p className="text-sm text-gray-600">{selectedOrder.deliveryCity}, {selectedOrder.deliveryPincode}</p>
        </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                    <input
                      type="date"
                      id="deliveryDate"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <select
                      id="paymentTerms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="immediate">Immediate Payment</option>
                      <option value="3_days">3 Days</option>
                      <option value="7_days">7 Days</option>
                      <option value="15_days">15 Days</option>
                      <option value="30_days">30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    id="supplierNotes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Any special instructions or terms..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => {
                    const reason = prompt('Please provide a reason for rejection:');
                    if (reason) {
                      handleRejectOrder(selectedOrder.id, reason);
                    }
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Order</span>
                </button>
                <button
                  onClick={() => {
                    const deliveryDate = (document.getElementById('deliveryDate') as HTMLInputElement).value;
                    const paymentTerms = (document.getElementById('paymentTerms') as HTMLSelectElement).value;
                    const notes = (document.getElementById('supplierNotes') as HTMLTextAreaElement).value;
                    
                    if (!deliveryDate) {
                      alert('Please select estimated delivery date');
                      return;
                    }
                    
                    handleApproveOrder(selectedOrder.id, deliveryDate, paymentTerms, notes);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;