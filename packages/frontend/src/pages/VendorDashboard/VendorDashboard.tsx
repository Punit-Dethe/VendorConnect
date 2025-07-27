import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { useRealtime } from '../../components/realtime/RealtimeProvider';
import {
  ShoppingCart, 
  Package, 
  TrendingUp,
  Clock,
  Plus,
  Minus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  CreditCard,
  MessageCircle,
  FileText,
  Bell,
  User,
  History
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
  supplier: {
    id: string;
    name: string;
    location: {
      city: string;
      state: string;
    };
    trustScore: number;
  };
}

interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  supplier: {
    id: string;
    name: string;
    mobile: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    total_price: number;
  }>;
  total_amount: number;
  status: string;
  order_type: string;
  delivery_address: string;
  delivery_city: string;
  delivery_pincode: string;
  created_at: string;
  estimated_delivery_time?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

const VendorDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications: realtimeNotifications, isConnected, joinUserRoom } = useRealtime();
  
  const [activeTab, setActiveTab] = useState('browse');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [orderForm, setOrderForm] = useState({
    delivery_address: '',
    delivery_city: '',
    delivery_pincode: '',
    notes: '',
    order_type: 'one_time'
  });

  const categories = ['vegetables', 'grains', 'spices', 'dairy', 'oils', 'pulses', 'meat', 'seafood'];

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadNotifications();
    
    // Join user room for real-time notifications
    if (user?.id && isConnected) {
      joinUserRoom(user.id);
    }
  }, [user?.id, isConnected]);

  // Merge real-time notifications with local notifications
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      // Convert real-time notifications to the expected format
      const formattedRealtimeNotifications = realtimeNotifications.map(rn => ({
        id: rn.id,
        title: rn.title,
        message: rn.message,
        type: rn.type,
        data: rn.data,
        is_read: rn.isRead || false,
        created_at: rn.createdAt?.toISOString() || new Date().toISOString()
      }));
      
      // Merge with existing notifications, avoiding duplicates
      setNotifications(prevNotifications => {
        const existingIds = new Set(prevNotifications.map(n => n.id));
        const newNotifications = formattedRealtimeNotifications.filter(rn => !existingIds.has(rn.id));
        return [...newNotifications, ...prevNotifications];
      });
      
      // If there are new supplier notifications, also refresh the products list
      const newSupplierNotifications = realtimeNotifications.filter(n => n.type === 'new_supplier');
      if (newSupplierNotifications.length > 0) {
        console.log('🔔 New supplier registered, refreshing products...');
        loadProducts();
      }
    }
  }, [realtimeNotifications]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products', {
        params: {
          category: selectedCategory || undefined,
          supplier_id: selectedSupplier || undefined,
          search: searchTerm || undefined
        }
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await api.get('/api/vendor/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedSupplier, searchTerm]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product_id: product.id, product, quantity }]);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId));
    } else {
      setCart(cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price_per_unit * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      setLoading(true);
      
      // Group cart items by supplier
      const supplierGroups = cart.reduce((groups, item) => {
        const supplierId = item.product.supplier_id;
        if (!groups[supplierId]) {
          groups[supplierId] = [];
        }
        groups[supplierId].push({
          product_id: item.product_id,
          quantity: item.quantity
        });
        return groups;
      }, {} as Record<string, any[]>);

      // Create orders for each supplier
      for (const [supplierId, items] of Object.entries(supplierGroups)) {
        await api.post('/api/orders', {
          supplier_id: supplierId,
          items,
          delivery_address: orderForm.delivery_address,
          delivery_city: orderForm.delivery_city,
          delivery_pincode: orderForm.delivery_pincode,
          notes: orderForm.notes,
          order_type: orderForm.order_type
        });
      }

      // Clear cart and reload orders
      setCart([]);
      setShowCart(false);
      loadOrders();
      setActiveTab('orders');
      
      alert('Orders placed successfully!');
    } catch (error: any) {
      console.error('Failed to place order:', error);
      alert(error.response?.data?.error?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
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

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
              <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
                {isConnected && (
                  <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 text-xs font-medium">Live</span>
              </div>
                )}
              </div>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
              </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', label: 'Browse Products', icon: Package },
              { id: 'orders', label: 'My Orders', icon: Clock },
              { id: 'suppliers', label: 'Suppliers', icon: MapPin },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'chat', label: 'Messages', icon: MessageCircle },
              { id: 'contracts', label: 'Contracts', icon: FileText },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
              </div>
            </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Browse Products Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
          </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={loadProducts}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Filter className="h-5 w-5" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      {/* Product Image */}
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

                      {/* Product Info */}
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      
                      {/* Supplier Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-500">
                          <p>{product.supplier.name}</p>
                          <p>{product.supplier.location.city}, {product.supplier.location.state}</p>
              </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{product.supplier.trustScore}</span>
              </div>
            </div>

                      {/* Price and Stock */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-indigo-600">₹{product.price_per_unit}</span>
                          <span className="text-gray-500 text-sm">/{product.unit}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Stock: {product.stock_quantity} {product.unit}
          </div>
        </div>

                      {/* Add to Cart */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={product.min_order_quantity}
                          max={product.stock_quantity}
                          defaultValue={product.min_order_quantity}
                          id={`quantity-${product.id}`}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <button
                          onClick={() => {
                            const quantityInput = document.getElementById(`quantity-${product.id}`) as HTMLInputElement;
                            const quantity = parseInt(quantityInput.value) || product.min_order_quantity;
                            addToCart(product, quantity);
                          }}
                          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Cart</span>
                  </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">My Orders</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{order.order_number}</h3>
                        <p className="text-gray-600">Supplier: {order.supplier?.name}</p>
                        <p className="text-gray-600">Mobile: {order.supplier?.mobile}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-1">₹{order.total_amount}</p>
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
                        <p className="text-sm text-gray-600">{order.delivery_address}</p>
                        <p className="text-sm text-gray-600">{order.delivery_city}, {order.delivery_pincode}</p>
                        {order.estimated_delivery_time && (
                          <p className="text-sm text-gray-600">
                            Estimated Delivery: {new Date(order.estimated_delivery_time).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Order Type: {order.order_type.replace('_', ' ').toUpperCase()}</span>
                      <span>Placed on: {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                )) : (
                  <div className="p-6 text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start by browsing products and placing your first order.</p>
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {notifications.length > 0 ? notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                    onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {!['browse', 'orders', 'notifications'].includes(activeTab) && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p className="text-gray-600">This feature is coming soon!</p>
          </div>
        )}
            </div>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Shopping Cart ({getTotalItems()} items)</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {/* Cart Items */}
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.supplier.name}</p>
                        <p className="text-sm text-gray-600">₹{item.product.price_per_unit}/{item.product.unit}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">₹{item.product.price_per_unit * item.quantity}</p>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, 0)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Order Form */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4">Delivery Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Delivery Address"
                        value={orderForm.delivery_address}
                        onChange={(e) => setOrderForm({...orderForm, delivery_address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={orderForm.delivery_city}
                        onChange={(e) => setOrderForm({...orderForm, delivery_city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={orderForm.delivery_pincode}
                        onChange={(e) => setOrderForm({...orderForm, delivery_pincode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <select
                        value={orderForm.order_type}
                        onChange={(e) => setOrderForm({...orderForm, order_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="one_time">One Time Order</option>
                        <option value="recurring">Recurring Monthly</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Special instructions (optional)"
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                      className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                    />
                  </div>

                  {/* Total and Checkout */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-semibold">Total: ₹{getTotalAmount()}</span>
                  </div>
                    <button
                      onClick={placeOrder}
                      disabled={loading || !orderForm.delivery_address || !orderForm.delivery_city || !orderForm.delivery_pincode}
                      className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;