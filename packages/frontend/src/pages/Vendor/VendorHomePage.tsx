import { useState, useEffect } from 'react'
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
  Bell, // Add Bell icon for notifications
  Settings
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/auth.slice'
import { useRealtime } from '../../components/realtime/RealtimeProvider'
import api from '../../services/api' // Import api for loading notifications
import ChatModal from '../../components/chat/ChatModal' // Import ChatModal

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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

const formatTrustScore = (score: number): string => {
  return `${Math.round(score)}/100`;
};

export default function VendorHomePage() {
  const { user } = useAppSelector((state: any) => state.auth)
  const dispatch = useAppDispatch()
  const { notifications: realtimeNotifications, isConnected, joinUserRoom } = useRealtime() // Use realtime notifications
  const [activeTab, setActiveTab] = useState<'recommended' | 'search'>('recommended')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [newSuppliers, setNewSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([]); // Local state for notifications
  const [showNotifications, setShowNotifications] = useState(false); // State to control notification dropdown
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentChatRecipient, setCurrentChatRecipient] = useState<{ id: string, name: string } | null>(null);
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string>('');

  useEffect(() => {
    fetchSuppliers();
    loadNotifications(); // Load notifications on mount

    if (user?.id && isConnected) {
      joinUserRoom(user.id);
    }
  }, [user?.id, isConnected]);

  // Listen for new supplier notifications and refresh
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
      
      const newSupplierNotifications = realtimeNotifications.filter(n => n.type === 'new_supplier');
      if (newSupplierNotifications.length > 0) {
        console.log('🔄 New supplier registered, refreshing homepage suppliers');
        fetchSuppliers(); // Refresh suppliers when a new one registers
      }
    }
  }, [realtimeNotifications]);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
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
        const transformedSuppliers = result.data.map((supplier: any) => ({
          id: supplier.id,
          name: supplier.name,
          businessName: supplier.businessType,
          trustScore: supplier.trustScore,
          location: `${supplier.location.city}, ${supplier.location.state}`,
          deliveryTime: supplier.stats.avgDeliveryTime,
          rating: 4.2,
          totalOrders: supplier.stats.completedOrders,
          categories: supplier.categories,
          distance: parseFloat(supplier.location.distance) || 0,
          specialties: supplier.categories,
          priceRange: 'medium' as const
        }));

        setSuppliers(transformedSuppliers);

        // Get recently registered suppliers (last 7 days)
        const recentSuppliers = transformedSuppliers.filter((supplier: any) => {
          // For now, show suppliers with low order counts as "new"
          return supplier.totalOrders < 5;
        }).slice(0, 3);

        setNewSuppliers(recentSuppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout())
  }

  // Get recommended suppliers (high trust score, nearby)
  const recommendedSuppliers = suppliers.filter(supplier =>
    supplier.trustScore >= 80 && supplier.distance <= 10
  ).sort((a, b) => b.trustScore - a.trustScore).slice(0, 6);

  // Mock data for fallback (remove when API is fully integrated)
  const mockRecommendedSuppliers: Supplier[] = [
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
      priceRange: 'medium' as const
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
      priceRange: 'low' as const
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
      priceRange: 'medium' as const
    }
  ]

  // Use real suppliers data, fallback to mock if empty
  const currentRecommendedSuppliers = recommendedSuppliers.length > 0 ? recommendedSuppliers : mockRecommendedSuppliers;
  const allSuppliers = suppliers.length > 0 ? suppliers : ([ // Explicitly cast the array literal to Supplier[]
    ...mockRecommendedSuppliers,
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
      priceRange: 'high' as const
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
      priceRange: 'medium' as const
    }
  ] as Supplier[])

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
          <button
            onClick={() => {
              setCurrentChatRecipient({ id: supplier.id, name: supplier.businessName });
              setCurrentChatRoomId(`general_${user?.id}_${supplier.id}`); // Create a general chat room ID
              setShowChatModal(true);
            }}
            className="btn btn-outline flex-1"
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
              {/* Live Connection Status */}
              {isConnected && (
                <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-xs font-medium">Live</span>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 ${!notification.is_read ? 'bg-blue-50' : ''} hover:bg-gray-50 cursor-pointer`}
                            onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                          >
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-gray-500">No new notifications.</p>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-4 border-t">
                        <button 
                          onClick={() => {
                            notifications.filter(n => !n.is_read).forEach(n => markNotificationAsRead(n.id));
                            setShowNotifications(false);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading suppliers...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Recommended Suppliers for You
                  </h3>
                  <p className="text-gray-600">
                    Based on your location, business type, and trust scores
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentRecommendedSuppliers.map((supplier) => (
                    <SupplierCard key={supplier.id} supplier={supplier} />
                  ))}
                </div>

                {/* New Suppliers Section */}
                {newSuppliers.length > 0 && (
                  <div className="mt-12">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        🆕 New Suppliers in Your Area
                      </h3>
                      <p className="text-gray-600">
                        Recently registered suppliers ready to serve you
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {newSuppliers.map((supplier) => (
                        <div key={supplier.id} className="relative">
                          <SupplierCard supplier={supplier} />
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            NEW
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center mt-8">
                  <button
                    onClick={() => setActiveTab('search')}
                    className="btn btn-outline"
                  >
                    View All Suppliers
                  </button>
                </div>
              </>
            )}
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
      {showChatModal && currentChatRecipient && user?.id && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          recipientName={currentChatRecipient.name}
          recipientId={currentChatRecipient.id}
          chatRoomId={currentChatRoomId}
        />
      )}
    </div>
  )
}