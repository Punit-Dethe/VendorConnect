import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  ShoppingCart,
  Package,
  ClipboardList,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

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
  vendor: {
    id: string;
    name: string;
    mobile: string;
  };
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

const VendorDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('browse');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedSupplier, searchTerm]);

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
    setCart(cart.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.product.price_per_unit * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    const orderItems = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price_per_unit: item.product.price_per_unit,
    }));

    const supplierId = cart[0]?.product?.supplier_id; // Assuming all products in cart are from same supplier
    if (!supplierId) {
      console.error("Cannot place order: Supplier ID not found in cart.");
      return;
    }

    try {
      const response = await api.post('/api/orders', {
        supplierId,
        items: orderItems,
        totalAmount: getTotalAmount(),
        orderType: 'one_time', // Default to one_time for now
        deliveryAddress: user?.location?.address || 'Default Address',
        deliveryCity: user?.location?.city || 'Default City',
        deliveryPincode: user?.location?.pincode || 'Default Pincode',
      });
      if (response.data.success) {
        console.log('Order placed successfully:', response.data.data);
        setCart([]); // Clear cart
        loadOrders(); // Refresh orders
        alert('Order placed successfully!');
      } else {
        alert(`Failed to place order: ${response.data.error.message}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const categories = ['all', 'Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Oils', 'Condiments'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center py-4">
              <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
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

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.businessType}</p>
              </div>
            </div>
          </div>

        {/* Navigation Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'browse'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Browse Products</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              <span>My Orders</span>
            </button>
          </nav>
              </div>

        {/* Browse Products Tab */}
        {activeTab === 'browse' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Browse Products</h2>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {/* Supplier Filter (Optional) */}
              {/* <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="input"
              >
                <option value="">All Suppliers</option>
                {/!* Populate with actual supplier data *!/}
              </select> */}
          </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-indigo-600 font-medium mb-2">{product.supplier.name}</p>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center text-gray-500 text-xs mb-3">
                        <p>{product.supplier.location.city}, {product.supplier.location.state}</p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xl font-bold text-gray-900">₹{product.price_per_unit}<span className="text-sm text-gray-500">/{product.unit}</span></p>
                        <p className="text-sm text-gray-600">Stock: {product.stock_quantity}</p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new products.
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            {orders.length > 0 ? (
                <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">From: {order.supplier.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm text-gray-700">
                          <span>{item.quantity} x {item.product_name}</span>
                          <span>₹{item.total_price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center border-t pt-4">
                      <p className="text-lg font-bold">Total: ₹{order.total_amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        Ordered on: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                </div>
              </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders placed yet</h3>
                <p className="text-gray-600">
                  Start browsing products and place your first order!
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="btn btn-primary mt-4"
                >
                  Browse Products
                  </button>
              </div>
            )}
            </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {cart.length === 0 ? (
                <p className="text-gray-600">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="space-y-4 max-h-80 overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <li key={item.product_id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-semibold text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">₹{item.product.price_per_unit} / {item.product.unit}</p>
                  </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className="px-2 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            className="px-2 py-1 border rounded-md text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                  </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center font-bold text-lg mb-4">
                    <span>Total:</span>
                    <span>₹{getTotalAmount().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={cart.length === 0}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;