import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Truck,
  Phone,
  Mail,
  Package,
  TrendingUp,
  Award,
  MessageCircle
} from 'lucide-react'
import { Navigation } from '../../components/common'
import { ChatModal } from '../../components/chat'
import { useRealtime } from '../../components/realtime/RealtimeProvider'

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
  description: string
  phone: string
  email: string
  verified: boolean
  joinedDate: string
  specialties: string[]
}

const formatTrustScore = (score: number): string => {
  return `${Math.round(score)}/100`;
};

export default function SuppliersPage() {
  const { notifications } = useRealtime();
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [minTrustScore, setMinTrustScore] = useState(0)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chatModal, setChatModal] = useState<{ isOpen: boolean; supplier: Supplier | null }>({
    isOpen: false,
    supplier: null
  })

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Listen for new supplier notifications
  useEffect(() => {
    const newSupplierNotifications = notifications.filter(n => n.type === 'new_supplier');
    console.log('🔍 All notifications:', notifications);
    console.log('🔍 New supplier notifications:', newSupplierNotifications);

    if (newSupplierNotifications.length > 0) {
      console.log('🔄 Refreshing suppliers list due to new supplier notification');
      // Refresh suppliers list when new supplier joins
      fetchSuppliers();
    }
  }, [notifications]);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vendor/suppliers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 API Response:', result);
        console.log('🔍 Raw suppliers data:', result.data);

        // Transform API data to match component interface
        const transformedSuppliers = result.data.map((supplier: any) => ({
          id: supplier.id,
          name: supplier.name,
          businessName: supplier.businessType,
          trustScore: supplier.trustScore,
          location: `${supplier.location.city}, ${supplier.location.state}`,
          deliveryTime: supplier.stats.avgDeliveryTime,
          rating: 4.2, // Mock rating for now
          totalOrders: supplier.stats.completedOrders,
          categories: supplier.categories,
          description: `${supplier.businessType} serving ${supplier.location.city}`,
          phone: '9876543210', // Mock phone
          email: 'supplier@example.com', // Mock email
          verified: true,
          joinedDate: new Date().toISOString().split('T')[0],
          specialties: supplier.categories
        }));
        console.log('🔍 Transformed suppliers:', transformedSuppliers);
        setSuppliers(transformedSuppliers);
      } else {
        console.error('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = (supplier: Supplier) => {
    setChatModal({ isOpen: true, supplier })
  }

  const closeChat = () => {
    setChatModal({ isOpen: false, supplier: null })
  }

  // Mock data for fallback - replace with actual API calls
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      businessName: 'Fresh Vegetables Co.',
      trustScore: 85,
      location: 'Andheri, Mumbai',
      deliveryTime: '2-4 hours',
      rating: 4.5,
      totalOrders: 150,
      categories: ['Vegetables', 'Fruits'],
      description: 'Premium quality fresh vegetables and fruits sourced directly from farms. Serving Mumbai vendors for over 5 years.',
      phone: '+91 98765 43210',
      email: 'rajesh@freshveggies.com',
      verified: true,
      joinedDate: '2019-03-15',
      specialties: ['Organic Vegetables', 'Seasonal Fruits', 'Bulk Orders']
    },
    {
      id: '2',
      name: 'Priya Sharma',
      businessName: 'Spice Masters',
      trustScore: 92,
      location: 'Crawford Market, Mumbai',
      deliveryTime: '1-3 hours',
      rating: 4.8,
      totalOrders: 200,
      categories: ['Spices', 'Condiments'],
      description: 'Traditional spice merchants with authentic Indian spices. Family business running for 3 generations.',
      phone: '+91 87654 32109',
      email: 'priya@spicemasters.com',
      verified: true,
      joinedDate: '2018-07-22',
      specialties: ['Authentic Spices', 'Custom Blends', 'Wholesale Rates']
    },
    {
      id: '3',
      name: 'Mohammed Ali',
      businessName: 'Grain Suppliers Ltd.',
      trustScore: 78,
      location: 'Dadar, Mumbai',
      deliveryTime: '4-6 hours',
      rating: 4.2,
      totalOrders: 95,
      categories: ['Grains', 'Pulses'],
      description: 'Quality grains and pulses at competitive prices. Specializing in bulk orders for restaurants and food vendors.',
      phone: '+91 76543 21098',
      email: 'ali@grainsuppliers.com',
      verified: true,
      joinedDate: '2020-01-10',
      specialties: ['Bulk Orders', 'Premium Grains', 'Fast Delivery']
    },
    {
      id: '4',
      name: 'Sunita Patel',
      businessName: 'Dairy Fresh',
      trustScore: 88,
      location: 'Bandra, Mumbai',
      deliveryTime: '1-2 hours',
      rating: 4.6,
      totalOrders: 180,
      categories: ['Dairy', 'Beverages'],
      description: 'Fresh dairy products delivered daily. Maintaining cold chain for quality assurance.',
      phone: '+91 65432 10987',
      email: 'sunita@dairyfresh.com',
      verified: true,
      joinedDate: '2019-11-05',
      specialties: ['Fresh Dairy', 'Cold Chain', 'Daily Delivery']
    }
  ]

  const categories = ['all', 'Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Oils', 'Condiments', 'Pulses', 'Beverages']
  const locations = ['all', 'Andheri', 'Crawford Market', 'Dadar', 'Bandra', 'Kurla', 'Malad', 'Borivali']

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || supplier.categories.includes(selectedCategory)
    const matchesLocation = selectedLocation === 'all' || supplier.location.includes(selectedLocation)
    const matchesTrustScore = supplier.trustScore >= minTrustScore

    return matchesSearch && matchesCategory && matchesLocation && matchesTrustScore
  })

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrustScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 75) return 'bg-blue-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole="vendor" />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Suppliers</h1>
              <p className="text-gray-600">Connect with trusted suppliers in your area</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {filteredSuppliers.length} suppliers found
              </div>
              <button
                onClick={fetchSuppliers}
                disabled={isLoading}
                className="btn btn-outline text-sm px-3 py-1 disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="input"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Trust Score: {minTrustScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading suppliers...</p>
          </div>
        ) : (
          <>
            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="card">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{supplier.businessName}</h3>
                          {supplier.verified && (
                            <Award className="w-5 h-5 text-blue-600" title="Verified Supplier" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">by {supplier.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            {supplier.rating} ({supplier.totalOrders} orders)
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {supplier.location}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrustScoreBg(supplier.trustScore)} ${getTrustScoreColor(supplier.trustScore)}`}>
                        Trust: {formatTrustScore(supplier.trustScore)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4">{supplier.description}</p>

                    {/* Categories */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {supplier.categories.map((category) => (
                          <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {supplier.specialties.map((specialty) => (
                          <span key={specialty} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-600">Delivery</p>
                        <p className="text-sm font-medium">{supplier.deliveryTime}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-600">Orders</p>
                        <p className="text-sm font-medium">{supplier.totalOrders}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-600">Since</p>
                        <p className="text-sm font-medium">{new Date(supplier.joinedDate).getFullYear()}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {supplier.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {supplier.email}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/vendor/supplier/${supplier.id}`}
                        className="btn btn-primary flex-1 text-center"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        View Products & Order
                      </Link>
                      <button
                        onClick={() => openChat(supplier)}
                        className="btn btn-outline"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </button>
                      <button className="btn btn-outline">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters, or refresh to see new suppliers
                </p>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setSelectedLocation('all')
                      setMinTrustScore(0)
                    }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={fetchSuppliers}
                    className="btn btn-outline"
                  >
                    Refresh Suppliers
                  </button>
                </div>
              </div>
            )}
          </>

        )}
      </div>

      {/* Chat Modal */}
      {
        chatModal.supplier && (
          <ChatModal
            isOpen={chatModal.isOpen}
            onClose={closeChat}
            recipientName={chatModal.supplier.businessName}
            recipientId={chatModal.supplier.id}
          />
        )
      }
    </div >
  )
}
