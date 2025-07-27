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
import DesktopNavigation from './DesktopNavigation' // Import the new component

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Brand */}
          <Link to={`/${userRole}/dashboard`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              {userRole === 'vendor' ? (
                <ShoppingCart className="w-6 h-6 text-white" />
              ) : (
                <Store className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                VendorConnect
              </h1>
              <p className="text-xs text-gray-500 capitalize -mt-0.5">{userRole} Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <DesktopNavigation navItems={navItems} isActive={isActive} />

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
            </button>

            {/* User Menu */}
            <Link
                to={`/${userRole}/profile`}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm text-white font-semibold text-sm group-hover:scale-105 transition-transform duration-200">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize -mt-0.5">{userRole}</p>
                </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 px-3 py-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block text-sm font-medium">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
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