import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Simple in-memory storage
const users: any[] = [
  {
    id: '1',
    name: 'Raj Kumar',
    mobile: '9876543210',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye', // password123
    role: 'vendor',
    businessType: 'Street Food Cart',
    address: '123 Street Food Lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    trustScore: 75
  },
  {
    id: '2',
    name: 'Priya Sharma',
    mobile: '9876543211',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye', // password123
    role: 'supplier',
    businessType: 'Vegetable Supplier',
    address: '456 Market Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400002',
    trustScore: 85
  }
];

const JWT_SECRET = 'your-secret-key';

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'VendorConnect Backend is running!',
    timestamp: new Date()
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, mobile, email, password, role, businessType, address, city, state, pincode } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.mobile === mobile);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'User already exists with this mobile number' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: (users.length + 1).toString(),
      name,
      mobile,
      email,
      password: hashedPassword,
      role,
      businessType,
      address,
      city,
      state,
      pincode,
      trustScore: 50,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, mobile: newUser.mobile },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          location: {
            address,
            city,
            state,
            pincode,
            coordinates: { lat: 0, lng: 0 }
          }
        },
        token,
        refreshToken: token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' }
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Find user
    const user = users.find(u => u.mobile === mobile);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role, mobile: user.mobile },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          location: {
            address: user.address,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            coordinates: { lat: 0, lng: 0 }
          }
        },
        token,
        refreshToken: token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' }
    });
  }
});

// Simple products endpoint
app.get('/api/products', (req, res) => {
  const products = [
    {
      id: '1',
      name: 'Fresh Tomatoes',
      description: 'Farm fresh red tomatoes',
      category: 'Vegetables',
      unit: 'kg',
      price: 40,
      stock: 100,
      supplierId: '2',
      supplierName: 'Priya Sharma',
      imageUrl: 'https://images.unsplash.com/photo-1546470427-e5ac89c8ba3a?w=300'
    },
    {
      id: '2',
      name: 'Red Onions',
      description: 'Premium quality red onions',
      category: 'Vegetables',
      unit: 'kg',
      price: 30,
      stock: 80,
      supplierId: '2',
      supplierName: 'Priya Sharma',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300'
    }
  ];

  res.json({
    success: true,
    data: products
  });
});

// Simple suppliers endpoint
app.get('/api/suppliers', (req, res) => {
  const suppliers = users.filter(u => u.role === 'supplier').map(s => ({
    id: s.id,
    name: s.name,
    businessName: s.businessType,
    trustScore: s.trustScore,
    location: s.city,
    deliveryTime: '2-4 hours',
    categories: ['Vegetables', 'Fruits'],
    specialties: ['Fresh', 'Organic']
  }));

  res.json({
    success: true,
    data: suppliers
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 VendorConnect Simple Server Started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log('✅ Health check: http://localhost:' + PORT + '/health');
  console.log('');
  console.log('🔐 Test credentials:');
  console.log('   Vendor: 9876543210 / password123');
  console.log('   Supplier: 9876543211 / password123');
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/products');
  console.log('   GET  /api/suppliers');
  console.log('');
  console.log('✨ Registration and login should work now!');
});