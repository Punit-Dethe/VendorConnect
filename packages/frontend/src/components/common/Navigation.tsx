import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Store,
  Plus,
  Search,
  Bell,
  LogOut,
  BarChart3,
  FileText,
  User,
  Menu,
  X
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/auth.slice'
import { NotificationCenter } from '../notifications'

interface NavigationProps {
  userRole: 'vendor' | 'supplier'
}

export default function Navigation({ userRole }: NavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: any) => state.auth)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const vendorNavItems = [
    {
      name: 'Dashboard',
      href: '/vendor/dashboard',
      icon: Home,
      description: 'Overview & quick actions'
    },
    {
      name: 'Find Suppliers',
      href: '/vendor/suppliers',
      icon: Search,
      description: 'Discover suppliers'
    },
    {
      name: 'My Orders',
      href: '/vendor/orders',
      icon: ShoppingCart,
      description: 'Track your orders'
    },
    {
      name: 'Contracts',
      href: '/contracts',
      icon: FileText,
      description: 'View agreements'
    },
    {
      name: 'Analytics',
      href: '/vendor/analytics',
      icon: BarChart3,
      description: 'Business insights'
    }
  ]

  const supplierNavItems = [
    {
      name: 'Dashboard',
      href: '/supplier/dashboard',
      icon: Home,
      description: 'Overview & notifications'
    },
    {
      name: 'Products',
      href: '/supplier/products',
      icon: Package,
      description: 'Manage inventory'
    },
    {
      name: 'Orders',
      href: '/supplier/orders',
      icon: ShoppingCart,
      description: 'Order requests'
    },
    {
      name: 'Contracts',
      href: '/contracts',
      icon: FileText,
      description: 'View agreements'
    },
    {
      name: 'Analytics',
      href: '/supplier/analytics',
      icon: BarChart3,
      description: 'Business insights'
    }
  ]

  const navItems = userRole === 'vendor' ? vendorNavItems : supplierNavItems

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link to={`/${userRole}/dashboard`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              {userRole === 'vendor' ? (
                <ShoppingCart className="w-7 h-7 text-white" />
              ) : (
                <Store className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VendorConnect
              </h1>
              <p className="text-sm text-gray-500 capitalize">{userRole} Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-500">{item.description}</span>
                  </div>
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                to={`/${userRole}/profile`}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block text-sm">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userRole={userRole}
      />
    </nav>
  )
}