import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  BarChart3
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logout } from '../../store/slices/auth.slice'
import { NotificationCenter } from '../notifications'

interface NavigationProps {
  userRole: 'vendor' | 'supplier'
}

export default function Navigation({ userRole }: NavigationProps) {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: any) => state.auth)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
  }

  const vendorNavItems = [
    {
      name: 'Dashboard',
      href: '/vendor/dashboard',
      icon: Home
    },
    {
      name: 'My Orders',
      href: '/vendor/orders',
      icon: ShoppingCart
    },
    {
      name: 'Place Order',
      href: '/vendor/orders/place',
      icon: Plus
    },
    {
      name: 'Find Suppliers',
      href: '/vendor/suppliers',
      icon: Search
    },
    {
      name: 'Analytics',
      href: '/vendor/analytics',
      icon: BarChart3
    }
  ]

  const supplierNavItems = [
    {
      name: 'Dashboard',
      href: '/supplier/dashboard',
      icon: Home
    },
    {
      name: 'Order Requests',
      href: '/supplier/orders',
      icon: ShoppingCart
    },
    {
      name: 'Products',
      href: '/supplier/products',
      icon: Package
    },
    {
      name: 'Analytics',
      href: '/supplier/analytics',
      icon: BarChart3
    }
  ]

  const navItems = userRole === 'vendor' ? vendorNavItems : supplierNavItems

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              {userRole === 'vendor' ? (
                <ShoppingCart className="w-6 h-6 text-white" />
              ) : (
                <Store className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VendorConnect</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                to={`/${userRole}/profile`}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
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