import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  Eye
} from 'lucide-react'
import { Navigation } from '../../components/common'

interface Product {
  id: string
  name: string
  category: string
  price: number
  unit: string
  stock: number
  minStock: number
  description: string
  image?: string
  status: 'active' | 'inactive' | 'out_of_stock'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Mock data - replace with actual API calls
  const products: Product[] = [
    {
      id: '1',
      name: 'Fresh Tomatoes',
      category: 'Vegetables',
      price: 40,
      unit: 'kg',
      stock: 150,
      minStock: 50,
      description: 'Fresh red tomatoes from local farms',
      status: 'active'
    },
    {
      id: '2',
      name: 'Red Chili Powder',
      category: 'Spices',
      price: 200,
      unit: 'kg',
      stock: 8,
      minStock: 20,
      description: 'Premium quality red chili powder',
      status: 'active'
    },
    {
      id: '3',
      name: 'Basmati Rice',
      category: 'Grains',
      price: 120,
      unit: 'kg',
      stock: 25,
      minStock: 100,
      description: 'Premium basmati rice',
      status: 'active'
    },
    {
      id: '4',
      name: 'Onions',
      category: 'Vegetables',
      price: 30,
      unit: 'kg',
      stock: 0,
      minStock: 25,
      description: 'Fresh onions',
      status: 'out_of_stock'
    }
  ]

  const categories = ['all', 'Vegetables', 'Spices', 'Grains', 'Dairy', 'Oils']

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'inactive': return 'Inactive'
      case 'out_of_stock': return 'Out of Stock'
      default: return status
    }
  }

  const isLowStock = (product: Product) => product.stock <= product.minStock && product.stock > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="supplier" />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">Manage your product inventory and pricing</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-3xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-gray-900">
                  {products.filter(p => isLowStock(p)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-3xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'out_of_stock').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                    {getStatusLabel(product.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(product.price)}/{product.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <div className="text-right">
                      <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' :
                        isLowStock(product) ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {product.stock} {product.unit}
                      </span>
                      {isLowStock(product) && (
                        <p className="text-xs text-yellow-600">Low stock!</p>
                      )}
                    </div>
                  </div>

                  {product.stock > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isLowStock(product) ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min((product.stock / product.minStock) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <button className="btn btn-outline flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </button>
                  <button className="btn btn-outline">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="btn btn-outline text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first product'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  )
}