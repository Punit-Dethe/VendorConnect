-- Enhanced VendorConnect Database Schema

-- Users table (vendors and suppliers)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('vendor', 'supplier')),
    trust_score INTEGER DEFAULT 50,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier profiles
CREATE TABLE IF NOT EXISTS supplier_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    business_license VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    categories TEXT[], -- Array of categories
    specialties TEXT[], -- Array of specialties
    delivery_time VARCHAR(50),
    price_range VARCHAR(20) CHECK (price_range IN ('low', 'medium', 'high')),
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- Days for payment
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor profiles
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    food_license VARCHAR(100),
    preferred_suppliers INTEGER[], -- Array of supplier IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50), -- kg, pieces, liters, etc.
    price_per_unit DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 10,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'delivered', 'cancelled')),
    order_type VARCHAR(20) DEFAULT 'one_time' CHECK (order_type IN ('one_time', 'recurring')),
    recurring_frequency VARCHAR(20), -- daily, weekly, monthly
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    payment_due_date DATE,
    delivery_address TEXT,
    notes TEXT,
    contract_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    contract_type VARCHAR(20) DEFAULT 'order' CHECK (contract_type IN ('order', 'recurring')),
    terms_and_conditions TEXT,
    payment_terms INTEGER, -- Days
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
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    contract_id INTEGER REFERENCES contracts(id),
    vendor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    supplier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    payment_gateway VARCHAR(50), -- razorpay, paytm, etc.
    gateway_transaction_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50), -- card, upi, netbanking, wallet, pay_later
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    due_date DATE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table for real-time updates
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- order_received, order_approved, payment_due, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trust score history
CREATE TABLE IF NOT EXISTS trust_score_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    previous_score INTEGER,
    new_score INTEGER,
    reason VARCHAR(200),
    order_id INTEGER REFERENCES orders(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Insert sample data
INSERT INTO users (mobile, password, name, email, role, trust_score) VALUES
('9876543210', '$2b$10$hash1', 'Raj Kumar', 'raj@vendor.com', 'vendor', 75),
('9876543211', '$2b$10$hash2', 'Priya Suppliers', 'priya@supplier.com', 'supplier', 85),
('9876543212', '$2b$10$hash3', 'Mumbai Food Co', 'mumbai@supplier.com', 'supplier', 90),
('9876543213', '$2b$10$hash4', 'Delhi Spices', 'delhi@supplier.com', 'supplier', 88)
ON CONFLICT (mobile) DO NOTHING;

INSERT INTO supplier_profiles (user_id, business_name, address, city, state, categories, specialties, delivery_time, price_range, payment_terms) VALUES
(2, 'Priya Fresh Supplies', '123 Market Street, Andheri', 'Mumbai', 'Maharashtra', ARRAY['Vegetables', 'Fruits'], ARRAY['Organic', 'Fresh Daily'], '2-4 hours', 'medium', 15),
(3, 'Mumbai Food Co', '456 Wholesale Market', 'Mumbai', 'Maharashtra', ARRAY['Spices', 'Grains'], ARRAY['Bulk Orders', 'Quality Assured'], '4-6 hours', 'low', 30),
(4, 'Delhi Spices Ltd', '789 Spice Market', 'Delhi', 'Delhi', ARRAY['Spices', 'Condiments'], ARRAY['Premium Quality', 'Fast Delivery'], '1-2 hours', 'high', 7)
ON CONFLICT DO NOTHING;

INSERT INTO vendor_profiles (user_id, business_name, address, city, state) VALUES
(1, 'Raj Street Food', 'Street 1, Bandra', 'Mumbai', 'Maharashtra')
ON CONFLICT DO NOTHING;