import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Star,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { Navigation } from '../../components/common'
import { useAppSelector } from '../../hooks/redux'
import toast from 'react-hot-toast'

interface ProfileFormData {
  name: string
  email: string
  mobile: string
  businessType: string
  address: string
  city: string
  state: string
  pincode: string
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function ProfilePage() {
  const { user } = useAppSelector((state: any) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      businessType: user?.businessType || '',
      address: user?.location?.address || '',
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      pincode: user?.location?.pincode || ''
    }
  })

  // Mock trust score history and achievements
  const trustScoreHistory = [
    { date: new Date('2024-01-01'), score: 50, event: 'Account Created' },
    { date: new Date('2024-01-05'), score: 55, event: 'First Order Completed' },
    { date: new Date('2024-01-10'), score: 62, event: 'Positive Feedback Received' },
    { date: new Date('2024-01-15'), score: 68, event: 'On-time Delivery' },
    { date: new Date('2024-01-20'), score: user?.trustScore || 75, event: 'Consistent Performance' }
  ]

  const achievements = [
    {
      id: '1',
      title: 'First Order',
      description: 'Completed your first order successfully',
      icon: CheckCircle,
      earned: true,
      date: new Date('2024-01-05')
    },
    {
      id: '2',
      title: 'Reliable Partner',
      description: '10 successful orders completed',
      icon: Award,
      earned: true,
      date: new Date('2024-01-15')
    },
    {
      id: '3',
      title: 'Trust Builder',
      description: 'Achieved trust score of 70+',
      icon: Shield,
      earned: user?.trustScore >= 70,
      date: user?.trustScore >= 70 ? new Date('2024-01-20') : undefined
    },
    {
      id: '4',
      title: 'Top Performer',
      description: 'Achieved trust score of 90+',
      icon: Star,
      earned: user?.trustScore >= 90,
      date: undefined
    }
  ]

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Here you would make an API call to update the profile
      console.log('Updating profile:', data)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

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

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'trust', name: 'Trust Score', icon: Shield },
    { id: 'achievements', name: 'Achievements', icon: Award }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userRole={user?.role} />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${getTrustScoreBg(user?.trustScore || 50)} ${getTrustScoreColor(user?.trustScore || 50)}`}>
                <Shield className="w-4 h-4 inline mr-1" />
                Trust Score: {user?.trustScore || 50}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6 text-center border-b border-gray-200">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                <p className="text-sm text-gray-500">{user?.businessType}</p>
              </div>

              <nav className="p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    )
                  })}
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="card">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancel}
                          className="btn btn-outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit(onSubmit)}
                          className="btn btn-primary"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        type="text"
                        disabled={!isEditing}
                        className="input"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        {...register('mobile', { required: 'Mobile is required' })}
                        type="tel"
                        disabled={!isEditing}
                        className="input"
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        disabled={!isEditing}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type *
                      </label>
                      <input
                        {...register('businessType', { required: 'Business type is required' })}
                        type="text"
                        disabled={!isEditing}
                        className="input"
                      />
                      {errors.businessType && (
                        <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      {...register('address', { required: 'Address is required' })}
                      rows={3}
                      disabled={!isEditing}
                      className="input resize-none"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        {...register('city', { required: 'City is required' })}
                        type="text"
                        disabled={!isEditing}
                        className="input"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        {...register('state', { required: 'State is required' })}
                        type="text"
                        disabled={!isEditing}
                        className="input"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        {...register('pincode', { required: 'Pincode is required' })}
                        type="text"
                        disabled={!isEditing}
                        className="input"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Member Since
                        </label>
                        <p className="text-sm text-gray-600">
                          {formatDate(user?.createdAt || new Date())}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Status
                        </label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'trust' && (
              <div className="space-y-6">
                {/* Trust Score Overview */}
                <div className="card">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Trust Score Overview</h2>
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getTrustScoreBg(user?.trustScore || 50)}`}>
                            <span className={`text-3xl font-bold ${getTrustScoreColor(user?.trustScore || 50)}`}>
                              {user?.trustScore || 50}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user?.trustScore >= 90 ? 'Excellent' :
                          user?.trustScore >= 75 ? 'Good' :
                            user?.trustScore >= 60 ? 'Fair' : 'Needs Improvement'}
                      </h3>
                      <p className="text-gray-600">
                        Your trust score reflects your reliability and performance
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Score History */}
                <div className="card">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Trust Score History</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {trustScoreHistory.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTrustScoreBg(entry.score)}`}>
                              <TrendingUp className={`w-4 h-4 ${getTrustScoreColor(entry.score)}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{entry.event}</p>
                              <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${getTrustScoreColor(entry.score)}`}>
                              {entry.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="card">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
                  <p className="text-gray-600">Track your milestones and accomplishments</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon
                      return (
                        <div
                          key={achievement.id}
                          className={`p-6 rounded-lg border-2 ${achievement.earned
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.earned
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                              }`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                {achievement.title}
                              </h3>
                              <p className={`text-sm mt-1 ${achievement.earned ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                {achievement.description}
                              </p>
                              {achievement.earned && achievement.date && (
                                <p className="text-xs text-green-600 mt-2">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  Earned on {formatDate(achievement.date)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}