import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, testConnection } from './config/database';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = 'your-secret-key';

// Helper functions
const generateId = () => crypto.randomBytes(8).toString('hex');
const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateContractNumber = () => `VC-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Get coordinates for Indian cities (mock geocoding)
const getCityCoordinates = (city: string, state: string): { lat: number, lng: number } => {
  const cityCoords: { [key: string]: { lat: number, lng: number } } = {
    'mumbai,maharashtra': { lat: 19.0760, lng: 72.8777 },
    'delhi,delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore,karnataka': { lat: 12.9716, lng: 77.5946 },
    'hyderabad,telangana': { lat: 17.3850, lng: 78.4867 },
    'ahmedabad,gujarat': { lat: 23.0225, lng: 72.5714 },
    'chennai,tamil nadu': { lat: 13.0827, lng: 80.2707 },
    'kolkata,west bengal': { lat: 22.5726, lng: 88.3639 },
    'pune,maharashtra': { lat: 18.5204, lng: 73.8567 },
    'jaipur,rajasthan': { lat: 26.9124, lng: 75.7873 },
    'surat,gujarat': { lat: 21.1702, lng: 72.8311 },
    'lucknow,uttar pradesh': { lat: 26.8467, lng: 80.9462 },
    'kanpur,uttar pradesh': { lat: 26.4499, lng: 80.3319 },
    'nagpur,maharashtra': { lat: 21.1458, lng: 79.0882 },
    'indore,madhya pradesh': { lat: 22.7196, lng: 75.8577 },
    'thane,maharashtra': { lat: 19.2183, lng: 72.9781 },
    'bhopal,madhya pradesh': { lat: 23.2599, lng: 77.4126 },
    'visakhapatnam,andhra pradesh': { lat: 17.6868, lng: 83.2185 },
    'pimpri-chinchwad,maharashtra': { lat: 18.6298, lng: 73.7997 },
    'patna,bihar': { lat: 25.5941, lng: 85.1376 },
    'vadodara,gujarat': { lat: 22.3072, lng: 73.1812 }
  };

  const key = `${city.toLowerCase()},${state.toLowerCase()}`;
  return cityCoords[key] || { lat: 20.5937, lng: 78.9629 }; // Default to center of India
};

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access token required' }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get user from database
    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }
};

// Notification helper
const createNotification = async (userId: number, type: string, title: string, message: string, data?: any) => {
  try {
    const result = await query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, type, title, message, data ? JSON.stringify(data) : null]);

    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(20) NOT NULL CHECK (role IN ('vendor', 'supplier')),
        business_type VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        trust_score INTEGER DEFAULT 50,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        unit VARCHAR(50),
        price_per_unit DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        minimum_stock INTEGER DEFAULT 10,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'delivered', 'cancelled')),
        order_type VARCHAR(20) DEFAULT 'one_time' CHECK (order_type IN ('one_time', 'recurring')),
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
        payment_method VARCHAR(50),
        payment_due_date DATE,
        delivery_address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        terms_and_conditions TEXT,
        payment_terms INTEGER,
        total_amount DECIMAL(10, 2),
        start_date DATE,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'cancelled')),
        vendor_signature BOOLEAN DEFAULT FALSE,
        supplier_signature BOOLEAN DEFAULT FALSE,
        vendor_signed_at TIMESTAMP,
        supplier_signed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
        due_date DATE,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data if tables are empty
    const userCount = await query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      // Insert sample users with coordinates
      const mumbaiCoords = getCityCoordinates('Mumbai', 'Maharashtra');
      const delhiCoords = getCityCoordinates('Delhi', 'Delhi');

      await query(`
        INSERT INTO users (mobile, password, name, email, role, business_type, address, city, state, pincode, latitude, longitude, trust_score)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13),
        ($14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26),
        ($27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39)
      `, [
        '9876543210', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye', 'Raj Kumar', 'raj@vendor.com', 'vendor', 'Street Food Cart', '123 Street Food Lane', 'Mumbai', 'Maharashtra', '400001', mumbaiCoords.lat, mumbaiCoords.lng, 75,
        '9876543211', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye', 'Priya Sharma', 'priya@supplier.com', 'supplier', 'Vegetable Supplier', '456 Market Street', 'Mumbai', 'Maharashtra', '400002', mumbaiCoords.lat, mumbaiCoords.lng, 85,
        '9876543212', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye', 'Delhi Spices Ltd', 'delhi@supplier.com', 'supplier', 'Spice Supplier', '789 Spice Market', 'Delhi', 'Delhi', '110001', delhiCoords.lat, delhiCoords.lng, 90
      ]);

      // Insert sample products
      await query(`
        INSERT INTO products (supplier_id, name, description, category, unit, price_per_unit, stock_quantity, minimum_stock, image_url)
        VALUES 
        (2, 'Fresh Tomatoes', 'Farm fresh red tomatoes', 'Vegetables', 'kg', 40.00, 100, 10, 'https://images.unsplash.com/photo-1546470427-e5ac89c8ba3a?w=300'),
        (2, 'Red Onions', 'Premium quality red onions', 'Vegetables', 'kg', 30.00, 80, 15, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300'),
        (3, 'Red Chili Powder', 'Spicy red chili powder', 'Spices', 'kg', 200.00, 25, 5, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300'),
        (3, 'Turmeric Powder', 'Pure turmeric powder', 'Spices', 'kg', 180.00, 30, 8, 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300')
      `);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'VendorConnect Enhanced DB Server is running!',
    timestamp: new Date(),
    features: ['Database Integration', 'Region-wise Suppliers', 'Auto Location Detection']
  });
});

// ===== AUTHENTICATION ENDPOINTS =====

// Register endpoint with database integration and location detection
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, mobile, email, password, role, businessType, address, city, state, pincode } = req.body;

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'User already exists with this mobile number' }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get coordinates for the city
    const coordinates = getCityCoordinates(city, state);

    // Create user in database
    const userResult = await query(`
      INSERT INTO users (mobile, password, name, email, role, business_type, address, city, state, pincode, latitude, longitude, trust_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, mobile, name, email, role, business_type, address, city, state, pincode, latitude, longitude, trust_score, created_at
    `, [mobile, hashedPassword, name, email, role, businessType, address, city, state, pincode, coordinates.lat, coordinates.lng, 50]);

    const newUser = userResult.rows[0];

    // If new supplier, notify all vendors in the region
    if (role === 'supplier') {
      const nearbyVendors = await query(`
        SELECT id, latitude, longitude FROM users 
        WHERE role = 'vendor' AND latitude IS NOT NULL AND longitude IS NOT NULL
      `);

      for (const vendor of nearbyVendors.rows) {
        const distance = calculateDistance(
          vendor.latitude, vendor.longitude,
          coordinates.lat, coordinates.lng
        );

        // Notify vendors within 50km radius
        if (distance <= 50) {
          await createNotification(
            vendor.id,
            'new_supplier',
            'New Supplier Available Nearby! 🏪',
            `${businessType} (${name}) has joined the platform in ${city}, ${distance}km away from you!`,
            {
              supplierId: newUser.id,
              supplierName: name,
              businessType,
              city,
              distance: distance.toFixed(1)
            }
          );
        }
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, mobile: newUser.mobile },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          mobile: newUser.mobile,
          email: newUser.email,
          role: newUser.role,
          businessType: newUser.business_type,
          location: {
            address: newUser.address,
            city: newUser.city,
            state: newUser.state,
            pincode: newUser.pincode,
            coordinates: {
              lat: parseFloat(newUser.latitude),
              lng: parseFloat(newUser.longitude)
            }
          },
          trustScore: newUser.trust_score
        },
        token,
        refreshToken: token
      },
      message: role === 'supplier' ? 'Supplier registered! Nearby vendors have been notified.' : 'Vendor registered successfully!'
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

    // Find user in database
    const userResult = await query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    const user = userResult.rows[0];

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

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
          businessType: user.business_type,
          location: {
            address: user.address,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            coordinates: {
              lat: parseFloat(user.latitude || 0),
              lng: parseFloat(user.longitude || 0)
            }
          },
          trustScore: user.trust_score
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

// ===== REGION-WISE SUPPLIER ENDPOINTS =====

// Get suppliers with region-wise filtering and distance calculation
app.get('/api/suppliers', async (req, res) => {
  try {
    const { region, city, maxDistance, userLat, userLng } = req.query;

    let whereClause = "WHERE role = 'supplier'";
    const params: any[] = [];
    let paramCount = 0;

    // Filter by region/city if specified
    if (region) {
      paramCount++;
      whereClause += ` AND (city ILIKE $${paramCount} OR state ILIKE $${paramCount})`;
      params.push(`%${region}%`);
    }

    if (city) {
      paramCount++;
      whereClause += ` AND city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    const suppliersResult = await query(`
      SELECT id, name, business_type, address, city, state, pincode, latitude, longitude, trust_score, created_at
      FROM users 
      ${whereClause}
      ORDER BY trust_score DESC, created_at DESC
    `, params);

    const suppliers = suppliersResult.rows.map((supplier: any) => {
      let distance = null;

      // Calculate distance if user coordinates provided
      if (userLat && userLng && supplier.latitude && supplier.longitude) {
        distance = calculateDistance(
          parseFloat(userLat as string),
          parseFloat(userLng as string),
          parseFloat(supplier.latitude),
          parseFloat(supplier.longitude)
        );
      }

      return {
        id: supplier.id,
        name: supplier.name,
        businessName: supplier.business_type,
        trustScore: supplier.trust_score,
        location: supplier.city,
        fullAddress: `${supplier.address}, ${supplier.city}, ${supplier.state}`,
        coordinates: {
          lat: parseFloat(supplier.latitude || 0),
          lng: parseFloat(supplier.longitude || 0)
        },
        distance: distance,
        deliveryTime: distance ? (distance < 5 ? '1-2 hours' : distance < 15 ? '2-4 hours' : '4-6 hours') : '2-4 hours',
        categories: ['Vegetables', 'Fruits', 'Spices'],
        specialties: ['Fresh', 'Organic'],
        isRecommended: supplier.trust_score > 80,
        totalOrders: Math.floor(Math.random() * 100) + 10,
        rating: (supplier.trust_score / 100 * 5).toFixed(1),
        priceRange: supplier.trust_score > 80 ? 'medium' : 'low',
        isNearby: distance ? distance <= 20 : false
      };
    });

    // Filter by max distance if specified
    let filteredSuppliers = suppliers;
    if (maxDistance && userLat && userLng) {
      filteredSuppliers = suppliers.filter(s => s.distance && s.distance <= parseFloat(maxDistance as string));
    }

    // Sort by distance if user location provided
    if (userLat && userLng) {
      filteredSuppliers.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    res.json({
      success: true,
      data: filteredSuppliers,
      meta: {
        total: filteredSuppliers.length,
        hasUserLocation: !!(userLat && userLng),
        searchRadius: maxDistance ? `${maxDistance}km` : 'unlimited'
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get suppliers' }
    });
  }
});

// Get nearby suppliers based on user location
app.get('/api/suppliers/nearby', authenticateToken, async (req: any, res) => {
  try {
    const { maxDistance = 25 } = req.query; // Default 25km radius

    if (!req.user.latitude || !req.user.longitude) {
      return res.status(400).json({
        success: false,
        error: { message: 'User location not available. Please update your profile.' }
      });
    }

    const suppliersResult = await query(`
      SELECT id, name, business_type, address, city, state, latitude, longitude, trust_score
      FROM users 
      WHERE role = 'supplier' AND latitude IS NOT NULL AND longitude IS NOT NULL
    `);

    const nearbySuppliers = suppliersResult.rows
      .map((supplier: any) => {
        const distance = calculateDistance(
          parseFloat(req.user.latitude),
          parseFloat(req.user.longitude),
          parseFloat(supplier.latitude),
          parseFloat(supplier.longitude)
        );

        return {
          ...supplier,
          distance,
          deliveryTime: distance < 5 ? '1-2 hours' : distance < 15 ? '2-4 hours' : '4-6 hours',
          isNearby: distance <= maxDistance
        };
      })
      .filter((supplier: any) => supplier.distance <= maxDistance)
      .sort((a: any, b: any) => a.distance - b.distance);

    res.json({
      success: true,
      data: nearbySuppliers,
      meta: {
        userLocation: {
          city: req.user.city,
          coordinates: {
            lat: parseFloat(req.user.latitude),
            lng: parseFloat(req.user.longitude)
          }
        },
        searchRadius: `${maxDistance}km`,
        found: nearbySuppliers.length
      }
    });
  } catch (error) {
    console.error('Get nearby suppliers error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get nearby suppliers' }
    });
  }
});

// Get supplier details with distance
app.get('/api/suppliers/:supplierId', async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { userLat, userLng } = req.query;

    const supplierResult = await query(`
      SELECT * FROM users WHERE id = $1 AND role = 'supplier'
    `, [supplierId]);

    if (supplierResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Supplier not found' }
      });
    }

    const supplier = supplierResult.rows[0];

    // Get supplier's products
    const productsResult = await query(`
      SELECT * FROM products WHERE supplier_id = $1 AND is_active = true
    `, [supplierId]);

    let distance = null;
    if (userLat && userLng && supplier.latitude && supplier.longitude) {
      distance = calculateDistance(
        parseFloat(userLat as string),
        parseFloat(userLng as string),
        parseFloat(supplier.latitude),
        parseFloat(supplier.longitude)
      );
    }

    const supplierDetails = {
      id: supplier.id,
      name: supplier.name,
      businessName: supplier.business_type,
      trustScore: supplier.trust_score,
      location: supplier.city,
      fullAddress: `${supplier.address}, ${supplier.city}, ${supplier.state}`,
      coordinates: {
        lat: parseFloat(supplier.latitude || 0),
        lng: parseFloat(supplier.longitude || 0)
      },
      distance: distance,
      phone: supplier.mobile,
      deliveryTime: distance ? (distance < 5 ? '1-2 hours' : distance < 15 ? '2-4 hours' : '4-6 hours') : '2-4 hours',
      categories: ['Vegetables', 'Fruits', 'Spices'],
      specialties: ['Fresh', 'Organic'],
      products: productsResult.rows.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        unit: p.unit,
        price: parseFloat(p.price_per_unit),
        stock: p.stock_quantity,
        minStock: p.minimum_stock,
        imageUrl: p.image_url,
        isActive: p.is_active
      })),
      totalOrders: Math.floor(Math.random() * 100) + 10,
      rating: (supplier.trust_score / 100 * 5).toFixed(1),
      priceRange: supplier.trust_score > 80 ? 'medium' : 'low',
      isNearby: distance ? distance <= 20 : false
    };

    res.json({
      success: true,
      data: supplierDetails
    });
  } catch (error) {
    console.error('Get supplier details error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get supplier details' }
    });
  }
});

const PORT = process.env.PORT || 5000;

// Start server with database initialization
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your database configuration.');
      process.exit(1);
    }

    // Initialize database
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log('🚀 VendorConnect Enhanced Database Server Started!');
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log('✅ Health check: http://localhost:' + PORT + '/health');
      console.log('');
      console.log('🗄️  Database Features:');
      console.log('   ✅ PostgreSQL Integration');
      console.log('   ✅ Persistent Data Storage');
      console.log('   ✅ Real-time User Registration');
      console.log('   ✅ Region-wise Supplier Discovery');
      console.log('   ✅ Automatic Location Detection');
      console.log('   ✅ Distance-based Recommendations');
      console.log('');
      console.log('🌍 Location Features:');
      console.log('   ✅ Auto-detect user region');
      console.log('   ✅ Calculate supplier distances');
      console.log('   ✅ Nearby supplier recommendations');
      console.log('   ✅ Region-wise filtering');
      console.log('   ✅ Delivery time estimation');
      console.log('');
      console.log('🔐 Test credentials:');
      console.log('   Vendor: 9876543210 / password123');
      console.log('   Supplier: 9876543211 / password123');
      console.log('');
      console.log('📋 Enhanced Endpoints:');
      console.log('   🌍 Region-wise Suppliers:');
      console.log('      GET  /api/suppliers?region=mumbai');
      console.log('      GET  /api/suppliers?city=mumbai&maxDistance=25');
      console.log('      GET  /api/suppliers/nearby (with auth)');
      console.log('');
      console.log('   🔐 Authentication:');
      console.log('      POST /api/auth/register (saves to DB)');
      console.log('      POST /api/auth/login');
      console.log('');
      console.log('🎯 New Registration Flow:');
      console.log('   1. User registers → Saved to database');
      console.log('   2. Location auto-detected → Coordinates stored');
      console.log('   3. If supplier → Nearby vendors notified');
      console.log('   4. Vendors search → See new suppliers immediately');
      console.log('   5. Distance calculated → Smart recommendations');
      console.log('');
      console.log('✨ Database integrated with region-wise supplier selection!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();