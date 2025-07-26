import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Zap,
  MapPin,
  Star,
  Clock,
  ShoppingCart,
  Phone,
  MessageCircle,
  Filter,
  TrendingUp,
  LogOut,
  Settings
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/auth.slice'

interface Supplier {
  id: string
  name: string
  businessName: string
  trustScore: number
  location: string
  deliveryTime: string
  rating: number
  totalOrders: number
  categories: string[]
  distance: number
  isRecommended?: boolean
  specialties: string[]
  priceRange: 'low' | 'medium' | 'high'
}

const formatTrustScore = (score: number): string => {
  return `${Math.round(score)}/100`;
};

export default function VendorHomePage() {
  const { user } = useAppSelector((state: any) => state.auth)
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState<'recommended' | 'search'>('recommended')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')

  const handleLogout = () => {
    dispatch(logout())
  }

  // Mock recommended suppliers based on trust score and location
  const recommendedSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      businessName: 'Fresh Vegetables Co.',
      trustScore: 92,
      location: 'Andheri, Mumbai',
      deliveryTime: '2-4 hours',
      rating: 4.8,
      totalOrders: 150,
      categories: ['Vegetables', 'Fruits'],
      distance: 1.2,
      isRecommended: true,
      specialties: ['Organic Vegetables', 'Same Day Delivery'],
      priceRange: 'medium'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      businessName: 'Spice Masters',
      trustScore: 89,
      location: 'Crawford Market, Mumbai',
      deliveryTime: '1-3 hours',
      rating: 4.7,
      totalOrders: 200,
      categories: ['Spices', 'Condiments'],
      distance: 2.1,
      isRecommended: true,
      specialties: ['Authentic Spices', 'Bulk Orders'],
      priceRange: 'low'
    },
    {
      id: '3',
      name: 'Mohammed Ali',
      businessName: 'Grain Suppliers Ltd.',
      trustScore: 85,
      location: 'Dadar, Mumbai',
      deliveryTime: '4-6 hours',
      rating: 4.5,
      totalOrders: 95,
      categories: ['Grains', 'Pulses'],
      distance: 3.5,
      isRecommended: true,
      specialties: ['Premium Grains', 'Wholesale Rates'],
      priceRange: 'medium'
    }
  ]

  const allSuppliers: Supplier[] = [
    ...recommendedSuppliers,
    {
      id: '4',
      name: 'Sunita Patel',
      businessName: 'Dairy Fresh',
      trustScore: 78,
      location: 'Bandra, Mumbai',
      deliveryTime: '1-2 hours',
      rating: 4.3,
      totalOrders: 80,
      categories: ['Dairy', 'Beverages'],
      distance: 2.8,
      specialties: ['Fresh Dairy', 'Cold Chain'],
      priceRange: 'high'
    },
    {
      id: '5',
      name: 'Amit Singh',
      businessName: 'Oil & More',
      trustScore: 82,
      location: 'Malad, Mumbai',
      deliveryTime: '3-5 hours',
      rating: 4.4,
      totalOrders: 120,
      categories: ['Oils', 'Condiments'],
      distance: 4.2,
      specialties: ['Cooking Oils', 'Bulk Supply'],
      priceRange: 'medium'
    }
  ]

  const categories = ['all', 'Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Oils', 'Condiments']
  const regions = ['all', 'Andheri', 'Crawford Market', 'Dadar', 'Bandra', 'Malad', 'Kurla', 'Borivali', 'Thane']

  const filteredSuppliers = allSuppliers.filter(supplier => {
    const matchesSearch = supplier.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || supplier.categories.includes(selectedCategory)
    const matchesRegion = selectedRegion === 'all' || supplier.location.includes(selectedRegion)
    return matchesSearch && matchesCategory && matchesRegion
  })

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrustScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-blue-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="p-6">
        {supplier.isRecommended && (
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Recommended for you
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.businessName}</h3>
            <p className="text-sm text-gray-600 mb-2">by {supplier.name}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                {supplier.rating} ({supplier.totalOrders} orders)
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {supplier.distance}km away
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrustScoreBg(supplier.trustScore)} ${getTrustScoreColor(supplier.trustScore)}`}>
            {formatTrustScore(supplier.trustScore)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {supplier.categories.map((category) => (
            <span key={category} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {category}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {supplier.specialties.slice(0, 2).map((specialty) => (
            <span key={specialty} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
              {specialty}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {supplier.deliveryTime}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getPriceRangeColor(supplier.priceRange)}`}>
            {supplier.priceRange.charAt(0).toUpperCase() + supplier.priceRange.slice(1)} Price
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/vendor/supplier/${supplier.id}`}
            className="btn btn-primary flex-1 text-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Products
          </Link>
          <button className="btn btn-outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </button>
          <button className="btn btn-outline">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  VendorConnect
                </h1>
                <p className="text-sm text-gray-600">Find trusted suppliers for your business</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.businessType}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-white/50 transition-all duration-300"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Welcome Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the best suppliers for your <span className="font-semibold text-indigo-600">{user?.businessType?.toLowerCase()}</span> business
            </p>
          </div>

          {/* Modern Action Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20">
              <button
                onClick={() => setActiveTab('recommended')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'recommended'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Smart Recommendations
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'search'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <Search className="w-5 h-5 inline mr-2" />
                Browse All Suppliers
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Suppliers Tab */}
        {activeTab === 'recommended' && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Recommended Suppliers for You
              </h3>
              <p className="text-gray-600">
                Based on your location, business type, and trust scores
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedSuppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => setActiveTab('search')}
                className="btn btn-outline"
              >
                View All Suppliers
              </button>
            </div>
          </div>
        )}

        {/* Search Suppliers Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Search All Suppliers
              </h3>
              <p className="text-gray-600">
                Find suppliers by name, category, or location
              </p>
            </div>

            {/* Search Filters */}
            <div className="card mb-6">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search suppliers..."
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
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="input"
                    >
                      {regions.map(region => (
                        <option key={region} value={region}>
                          {region === 'all' ? 'All Regions' : region}
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

            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse our recommended suppliers
                </p>
                <button
                  onClick={() => setActiveTab('recommended')}
                  className="btn btn-primary mt-4"
                >
                  View Recommendations
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}