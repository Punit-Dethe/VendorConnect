import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { checkAuth } from './store/slices/auth.slice'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { RealtimeProvider } from './components/realtime/RealtimeProvider'
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary' // Import ErrorBoundary directly

// Pages
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Login/LoginPage'
import RegisterPage from './pages/Register/RegisterPage'
import VendorDashboard from './pages/VendorDashboard/VendorDashboard'
import SupplierDashboard from './pages/SupplierDashboard/SupplierDashboard'
import ProductsPage from './pages/Products/ProductsPage'
import PlaceOrderPage from './pages/Orders/PlaceOrderPage'
import OrdersPage from './pages/Orders/OrdersPage'
import SuppliersPage from './pages/Suppliers/SuppliersPage'
import AnalyticsPage from './pages/Analytics/AnalyticsPage'
import ProfilePage from './pages/Profile/ProfilePage'
import VendorHomePage from './pages/Vendor/VendorHomePage'
import VendorLoginPage from './pages/Auth/VendorLoginPage'
import SupplierLoginPage from './pages/Auth/SupplierLoginPage'
import SupplierDetailPage from './pages/Vendor/SupplierDetailPage'
import CheckoutPage from './pages/Vendor/CheckoutPage'
import VendorOrdersPage from './pages/Vendor/VendorOrdersPage'
import ContractsPage from './pages/Contracts/ContractsPage'

function App() {
  const dispatch = useAppDispatch()
  const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <RealtimeProvider userId={user?.id}>
      <ErrorBoundary>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={user?.role === 'vendor' ? '/vendor/home' : '/supplier/dashboard'} replace />
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Separate login pages */}
          <Route
            path="/vendor/login"
            element={
              isAuthenticated && user?.role === 'vendor' ? (
                <Navigate to="/vendor/home" replace />
              ) : (
                <VendorLoginPage />
              )
            }
          />
          <Route
            path="/supplier/login"
            element={
              isAuthenticated && user?.role === 'supplier' ? (
                <Navigate to="/supplier/dashboard" replace />
              ) : (
                <SupplierLoginPage />
              )
            }
          />

          {/* Legacy routes for backward compatibility */}
          <Route
            path="/login"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to={user?.role === 'vendor' ? '/vendor/home' : '/supplier/dashboard'} replace />
              ) : (
                <RegisterPage />
              )
            }
          />

          {/* Protected vendor routes */}
          <Route
            path="/vendor/home"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders/place"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <PlaceOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/suppliers"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <SuppliersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/analytics"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/profile"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/supplier/:supplierId"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <SupplierDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/checkout"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/my-orders"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Protected supplier routes */}
          <Route
            path="/supplier/dashboard"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/orders"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/products"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/analytics"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/profile"
            element={
              <ProtectedRoute allowedRoles={['supplier']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Contracts routes for both vendor and supplier */}
          <Route
            path="/contracts"
            element={
              <ProtectedRoute allowedRoles={['vendor', 'supplier']}>
                <ContractsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </RealtimeProvider>
  )
}

export default App