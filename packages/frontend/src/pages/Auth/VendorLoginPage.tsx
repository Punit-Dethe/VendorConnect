import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ShoppingCart, User } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { login, clearError } from '../../store/slices/auth.slice'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

const schema = yup.object({
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid mobile number'),
  password: yup.string().required('Password is required'),
})

type FormData = {
  mobile: string
  password: string
}

export default function VendorLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'vendor') {
        navigate('/vendor/home', { replace: true })
      } else {
        toast.error('Please use the supplier login page')
        dispatch(clearError())
      }
    }
  }, [isAuthenticated, user, navigate, dispatch])

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(login(data)).unwrap()
    } catch (error) {
      // Error is handled by the slice and displayed via useEffect
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">VendorConnect</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back, Vendor!
          </h2>
          <p className="text-gray-600">
            Sign in to find trusted suppliers for your business
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                {...register('mobile')}
                type="tel"
                placeholder="Enter your mobile number"
                className="input"
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
            <p className="text-sm text-blue-700">
              Mobile: <strong>9876543210</strong><br />
              Password: <strong>password123</strong>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to VendorConnect?</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/vendor/register"
                className="w-full btn btn-outline flex items-center justify-center"
              >
                <User className="w-4 h-4 mr-2" />
                Create Vendor Account
              </Link>

              <div className="text-center">
                <span className="text-sm text-gray-600">Are you a supplier? </span>
                <Link
                  to="/supplier/login"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  Login here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}