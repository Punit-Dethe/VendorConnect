# 🇮🇳 VendorConnect - Street Food Vendor & Supplier Platform

A comprehensive platform connecting street food vendors with suppliers in India, featuring real-time order management, digital contracts, payment gateway integration, and trust-based transactions.

## 🌟 Features

### ✅ **Complete Feature Set**
- **Payment Gateway Integration** - UPI, Card, Net Banking, Wallet, Pay Later
- **Real-Time Order Management** - Instant notifications and approvals
- **Digital Contract System** - Auto-generated legal agreements
- **Trust Score System** - Reliability tracking for all users
- **Advanced Product Management** - Real-time inventory with low stock alerts
- **Notification System** - Real-time updates for all activities
- **Multi-Role Authentication** - Separate interfaces for vendors and suppliers

### 🎯 **For Vendors (Street Food Sellers)**
- Browse suppliers by region and trust score
- Smart product recommendations
- Shopping cart with multiple payment options
- Real-time order tracking
- Digital contract signing
- Payment history and management
- Recurring order setup

### 🏪 **For Suppliers (Wholesalers)**
- Real-time order requests with vendor trust scores
- Order approval/rejection system
- Complete product inventory management
- Stock level monitoring and alerts
- Payment tracking with flexible terms
- Digital contract management
- Business analytics dashboard

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd VendorConnect
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb vendor_supplier_db

# Initialize database with schema
cd packages/backend
node scripts/init-db.js
```

### 3. Environment Configuration
Create `.env` files in both frontend and backend directories:

**Backend (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vendor_supplier_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=5000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# Backend: cd packages/backend && npm run dev
# Frontend: cd packages/frontend && npm run dev
```

### 5. Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔐 Test Credentials


## 📱 User Journey

### **Vendor Workflow**
1. **Login** → Modern dashboard with supplier recommendations
2. **Browse Suppliers** → Filter by region, category, trust score
3. **View Products** → Real-time stock levels and pricing
4. **Add to Cart** → Multiple items from same supplier
5. **Checkout** → Choose payment method (including pay later)
6. **Digital Contract** → Auto-generated, both parties sign
7. **Order Tracking** → Real-time status updates
8. **Payment** → Flexible terms as per contract

### **Supplier Workflow**
1. **Login** → Professional business dashboard
2. **Manage Products** → Add, update, restock inventory
3. **Receive Orders** → Real-time notifications with vendor trust scores
4. **Review & Approve** → Assess vendor reliability before approval
5. **Digital Contract** → Review and sign generated contracts
6. **Track Payments** → Monitor due dates and payment status
7. **Analytics** → Business insights and performance metrics

## 🛠 Technical Architecture

### **Backend Stack**
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Primary database with full ACID compliance
- **JWT Authentication** - Secure token-based auth
- **Real-time Notifications** - Event-driven architecture
- **Payment Integration** - Mock Razorpay gateway (production-ready)

### **Frontend Stack**
- **React + TypeScript** - Modern UI with type safety
- **Tailwind CSS** - Utility-first styling with custom components
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Responsive Design** - Mobile-first approach

### **Key APIs**

#### **Enhanced Product Management**
```
GET    /api/v2/products              # Get all products with filters
GET    /api/v2/products/vendor       # Get products for vendor
GET    /api/v2/products/supplier     # Get supplier's products
POST   /api/v2/products              # Create new product
PUT    /api/v2/products/:id          # Update product
POST   /api/v2/products/:id/restock  # Restock product
```

#### **Advanced Order Management**
```
POST   /api/v2/orders                # Create order with contract
GET    /api/v2/orders/vendor         # Get vendor orders
GET    /api/v2/orders/supplier       # Get supplier orders
POST   /api/v2/orders/:id/approve    # Approve order
POST   /api/v2/orders/:id/reject     # Reject order
```

#### **Payment System**
```
POST   /api/payments/initiate        # Initiate payment
GET    /api/payments/history         # Payment history
GET    /api/payments/pending         # Pending payments
```

#### **Digital Contracts**
```
GET    /api/contracts                # Get user contracts
GET    /api/contracts/:id            # Get specific contract
POST   /api/contracts/:id/sign       # Sign contract
```

#### **Notifications**
```
GET    /api/notifications            # Get notifications
GET    /api/notifications/unread     # Get unread notifications
PUT    /api/notifications/:id/read   # Mark as read
```

## 🎨 Modern UI Features

### **Design System**
- **Glassmorphism Effects** - Modern backdrop blur and transparency
- **Gradient Designs** - Beautiful color gradients throughout
- **Smooth Animations** - Hover effects and transitions
- **Enhanced Typography** - Improved font weights and spacing
- **Contextual Icons** - Meaningful icons with better styling
- **Visual Hierarchy** - Clear information architecture

### **User Experience**
- **Vendor Interface** - Customer-like, intuitive shopping experience
- **Supplier Interface** - Professional business dashboard
- **Responsive Design** - Works perfectly on all devices
- **Real-time Updates** - Live notifications and status changes
- **Visual Feedback** - Clear indicators for all interactions

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Separate permissions for vendors and suppliers
- **Input Validation** - Comprehensive data validation
- **SQL Injection Protection** - Parameterized queries
- **Trust Score System** - Fraud prevention through reputation
- **Digital Signatures** - Contract authenticity verification

## 📊 Database Schema

### **Core Tables**
- `users` - User authentication and basic info
- `vendor_profiles` - Vendor-specific information
- `supplier_profiles` - Supplier business details
- `products` - Product catalog with real-time stock
- `orders` - Order management with status tracking
- `contracts` - Digital agreements with signatures
- `payments` - Payment tracking and history
- `notifications` - Real-time notification system

## 🚀 Deployment

### **Production Setup**
1. Set up PostgreSQL database
2. Configure environment variables
3. Build frontend: `npm run build`
4. Deploy backend to your server
5. Set up reverse proxy (nginx)
6. Configure SSL certificates

### **Environment Variables**
```env
# Database
DB_HOST=your_db_host
DB_NAME=vendor_supplier_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_strong_jwt_secret

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Indian street food vendor community
- Designed to bridge the gap between vendors and suppliers
- Focused on trust, transparency, and efficiency

---

**VendorConnect** - Empowering India's Street Food Economy 🇮🇳✨
