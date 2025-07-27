const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'VendorConnect Backend is running!',
    timestamp: new Date(),
    features: [
      'Authentication System',
      'Payment Gateway Integration',
      'Real-time Order Management',
      'Digital Contract System',
      'Trust Score Tracking',
      'Notification System'
    ]
  });
});

// Test auth route
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint working',
    data: {
      testCredentials: {
        vendor: {
          mobile: '9876543210',
          password: 'password123'
        },
        supplier: {
          mobile: '9876543211',
          password: 'password123'
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 VendorConnect Test Server Started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log('✅ Health check: http://localhost:' + PORT + '/health');
  console.log('✅ Auth test: POST http://localhost:' + PORT + '/api/auth/test');
  console.log('');
  console.log('🔐 Test credentials:');
  console.log('   Vendor: 9876543210 / password123');
  console.log('   Supplier: 9876543211 / password123');
});