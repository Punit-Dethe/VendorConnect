# VendorConnect - Digital Marketplace for Street Food Vendors

A comprehensive digital marketplace designed to streamline the supply chain for India's street food vendors. The platform connects small food vendors with raw material suppliers through a trust-based system, digital contracts, and automated matching algorithms.

## 🚀 Features

### For Vendors
- **Smart Supplier Matching**: Auto-match with trusted suppliers based on location, availability, and trust scores
- **Order Management**: Place one-time or recurring orders with real-time tracking
- **Trust-Based Selection**: View supplier TrustScores and make informed decisions
- **Digital Contracts**: Secure agreements with clear terms and payment guarantees
- **Payment Integration**: UPI payments and invoice upload support
- **Real-time Chat**: Communicate directly with suppliers

### For Suppliers
- **Inventory Management**: Manage products, pricing, and stock levels
- **Order Processing**: Accept/decline orders and manage delivery schedules
- **Trust Building**: Build reputation through reliable service and quality
- **Analytics Dashboard**: Track performance, revenue, and customer satisfaction
- **Low Stock Alerts**: Automated notifications for inventory management

### Platform Features
- **TrustScore System**: Transparent scoring based on reliability, quality, and performance
- **Real-time Notifications**: SMS, email, and in-app notifications
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Secure Authentication**: JWT-based authentication with role-based access
- **Data Analytics**: Comprehensive reporting and insights

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React.js with TypeScript, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: PostgreSQL with Redis for caching
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time**: Socket.io for chat and notifications
- **Deployment**: Docker containers with Docker Compose

### Project Structure
```
vendor-supplier-platform/
├── packages/
│   ├── shared/          # Shared types, constants, and utilities
│   ├── backend/         # Node.js API server
│   └── frontend/        # React.js web application
├── docker-compose.yml   # Development environment setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- PostgreSQL (if running locally)
- Redis (if running locally)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vendor-supplier-platform
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```
   
   This will:
   - Install all dependencies
   - Build the shared package
   - Create environment files
   - Set up the project structure

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```
   
   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6379
   - Backend API on port 5000
   - Frontend app on port 3000

4. **Or start manually**
   ```bash
   # Start databases first (if not using Docker)
   # PostgreSQL on port 5432
   # Redis on port 6379
   
   # Terminal 1 - Backend
   cd packages/backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd packages/frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/health

### Troubleshooting

#### Common Issues

1. **"Cannot find module '@vendor-supplier/shared'"**
   ```bash
   cd packages/shared
   npm run build
   cd ../frontend
   npm install
   ```

2. **CSS/Tailwind errors**
   ```bash
   cd packages/frontend
   npm install tailwindcss postcss autoprefixer
   ```

3. **Database connection errors**
   - Ensure PostgreSQL is running on port 5432
   - Check database credentials in `.env` file
   - Run: `docker-compose up postgres -d`

4. **Port already in use**
   ```bash
   # Kill processes on ports
   npx kill-port 3000 5000
   ```

5. **Module resolution errors**
   ```bash
   # Clean install
   rm -rf node_modules packages/*/node_modules
   npm run setup
   ```

### Environment Variables

Create `.env` files in the backend package:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vendor_supplier_db
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📱 Usage

### Getting Started

1. **Visit the landing page** at http://localhost:3000
2. **Choose your role**: Vendor or Supplier
3. **Register** with your business details
4. **Complete your profile** and start using the platform

### For Vendors
1. Browse suppliers and products
2. Place orders (one-time or recurring)
3. Track order status in real-time
4. Make payments via UPI or invoice upload
5. Rate and review suppliers

### For Suppliers
1. Add your products and set pricing
2. Manage inventory and stock levels
3. Accept/decline order requests
4. Create digital contracts
5. Track payments and analytics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh-token` - Refresh JWT token

### Order Management
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Product Management
- `GET /api/products` - Get products
- `POST /api/products` - Create product (suppliers only)
- `PUT /api/products/:id` - Update product
- `GET /api/categories` - Get product categories

## 🔒 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers

## 📊 Monitoring

- Application performance monitoring
- Error tracking and logging
- Business metrics dashboards
- Real-time notifications
- Database query optimization

## 📞 Support

For support, email support@vendorconnect.com or join our Slack channel.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for India's street food vendor community
- Inspired by the need for supply chain digitization
- Thanks to all contributors and testers

---

**VendorConnect** - Connecting street food vendors with trusted suppliers across India. 🇮🇳