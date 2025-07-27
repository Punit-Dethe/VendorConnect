import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Plus,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  EyeOff,
  ShoppingCart,
  BarChart3,
  X
} from 'lucide-react'
import { Navigation } from '../../components/common'

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  stockQuantity: number;
  minOrderQuantity: number;
  images: string[];
  isAvailable: boolean;
  needsRestock: boolean;
  stockStatus: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    pricePerUnit: '',
    stockQuantity: '',
    minOrderQuantity: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/supplier/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(result.data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingProduct
        ? `http://localhost:5000/api/supplier/products/${editingProduct.id}`
        : 'http://localhost:5000/api/supplier/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();

        if (editingProduct) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? result.data : p));
          alert('Product updated successfully!');
        } else {
          setProducts(prev => [result.data, ...prev]);
          alert('Product added successfully!');
        }

        closeModal();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/supplier/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert('Product deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      pricePerUnit: '',
      stockQuantity: '',
      minOrderQuantity: '',
      isAvailable: true
    });
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit.toString(),
      stockQuantity: product.stockQuantity.toString(),
      minOrderQuantity: product.minOrderQuantity.toString(),
      isAvailable: product.isAvailable
    });
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      pricePerUnit: '',
      stockQuantity: '',
      minOrderQuantity: '',
      isAvailable: true
    });
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/supplier/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !product.isAvailable })
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(prev => prev.map(p => p.id === product.id ? result.data : p));
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const lowStockCount = products.filter(p => p.needsRestock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.pricePerUnit), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation userRole="supplier" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              My Products
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your product inventory and pricing</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/supplier/analytics'}
              className="btn btn-outline flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </button>
            <button
              onClick={openAddModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card card-elevated bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-blue-900">{products.length}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {products.filter(p => p.isAvailable).length} active
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">Low Stock Alert</p>
                  <p className="text-3xl font-bold text-red-900">{lowStockCount}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {lowStockCount > 0 ? 'Needs attention' : 'All good'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Inventory Value</p>
                  <p className="text-3xl font-bold text-green-900">₹{(totalValue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-green-600 mt-1">
                    ₹{totalValue.toLocaleString()} total
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-elevated bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-purple-900">{categories.length - 1}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Product types
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="card mb-8">
          <div className="card-content">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-12"
                  />
                </div>
              </div>
              <div className="lg:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:w-48 flex items-end">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{filteredProducts.length} products</p>
                  <p className="text-xs">of {products.length} total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {products.length === 0 ? 'No products yet' : 'No products found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {products.length === 0 ? 'Start by adding your first product' : 'Try adjusting your search criteria'}
            </p>
            {products.length === 0 && (
              <button
                onClick={openAddModal}
                className="btn btn-primary"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card card-elevated group hover:scale-105 transition-all duration-300">
                <div className="card-content">
                  {/* Product Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <button
                          onClick={() => toggleAvailability(product)}
                          className={`p-1.5 rounded-lg transition-all ${product.isAvailable
                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                            : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                            }`}
                          title={product.isAvailable ? 'Click to disable' : 'Click to enable'}
                        >
                          {product.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product.stockStatus)}`}>
                          {product.stockStatus.toUpperCase()} STOCK
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                    </div>
                  </div>

                  {/* Stock and Pricing Info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                        <p className="text-lg font-bold text-gray-900">
                          {product.stockQuantity} <span className="text-sm font-normal text-gray-600">{product.unit}</span>
                        </p>
                        {product.needsRestock && (
                          <p className="text-xs text-red-600 font-medium mt-1">⚠️ Restock needed</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price per {product.unit}</p>
                        <p className="text-lg font-bold text-green-600">₹{product.pricePerUnit}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Min: {product.minOrderQuantity} {product.unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 btn btn-outline text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Product
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-outline text-red-600 hover:bg-red-50 hover:border-red-200 text-sm px-4"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {editingProduct ? 'Update your product details' : 'Add a new product to your inventory'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="e.g., Fresh Organic Tomatoes"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input resize-none"
                    rows={3}
                    placeholder="Brief description of your product quality and features"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                    >
                      <option value="">Choose category</option>
                      <option value="vegetables">🥕 Vegetables</option>
                      <option value="fruits">🍎 Fruits</option>
                      <option value="grains">🌾 Grains & Cereals</option>
                      <option value="spices">🌶️ Spices & Herbs</option>
                      <option value="dairy">🥛 Dairy Products</option>
                      <option value="meat">🥩 Meat & Poultry</option>
                      <option value="beverages">🥤 Beverages</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Unit of Measurement *
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select unit</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="l">Liter (l)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="pieces">Pieces</option>
                      <option value="dozen">Dozen</option>
                      <option value="pack">Pack/Bundle</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Price per Unit (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                      className="input pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Current Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                      className="input"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Minimum Order Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.minOrderQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                      className="input"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isAvailable" className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Make product available for orders</span>
                      <p className="text-xs text-gray-600">Vendors will be able to see and order this product</p>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 btn btn-outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      editingProduct ? 'Update Product' : 'Add Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}