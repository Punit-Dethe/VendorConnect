import { Link } from 'react-router-dom'
import { ShoppingCart, Users, TrendingUp, Shield, Clock, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">VendorConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/vendor/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Vendor Login
              </Link>
              <Link
                to="/supplier/login"
                className="btn btn-primary"
              >
                Supplier Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Connect Street Food Vendors
              <span className="block text-primary-600">with Trusted Suppliers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your supply chain with our digital marketplace. Get transparent pricing,
              reliable delivery tracking, and build trust through our comprehensive scoring system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?role=vendor"
                className="btn btn-primary text-lg px-8 py-4"
              >
                Join as Vendor
              </Link>
              <Link
                to="/register?role=supplier"
                className="btn btn-outline text-lg px-8 py-4"
              >
                Join as Supplier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VendorConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for India's street food ecosystem with features that matter most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Trust-Based System</h3>
              <p className="text-gray-600">
                Transparent TrustScores help you make informed decisions based on reliability,
                quality, and performance history.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Track your orders from placement to delivery with real-time updates and
                estimated delivery times.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Matching</h3>
              <p className="text-gray-600">
                Our algorithm matches vendors with the best suppliers based on location,
                availability, and trust metrics.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Contracts</h3>
              <p className="text-gray-600">
                Secure digital contracts with clear terms, delivery timelines, and
                payment guarantees for both parties.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
              <p className="text-gray-600">
                Rate and review suppliers to maintain quality standards and help
                other vendors make better choices.
              </p>
            </div>

            <div className="card p-8 text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Ordering</h3>
              <p className="text-gray-600">
                Browse categorized products with real-time pricing and set up
                recurring orders for your regular needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-xl text-gray-600">Active Vendors</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-xl text-gray-600">Trusted Suppliers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-yellow-600 mb-2">50K+</div>
              <div className="text-xl text-gray-600">Orders Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of vendors and suppliers who trust VendorConnect for their business needs.
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Start Your Journey Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VendorConnect</span>
              </div>
              <p className="text-gray-400">
                Connecting street food vendors with trusted suppliers across India.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register?role=vendor" className="hover:text-white">For Vendors</Link></li>
                <li><Link to="/register?role=supplier" className="hover:text-white">For Suppliers</Link></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">API Docs</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VendorConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}