const {
  Pool
} = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vendor_supplier_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing VendorConnect database...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('   - users');
    console.log('   - supplier_profiles');
    console.log('   - vendor_profiles');
    console.log('   - products');
    console.log('   - orders');
    console.log('   - order_items');
    console.log('   - contracts');
    console.log('   - payments');
    console.log('   - notifications');
    console.log('   - trust_score_history');
    console.log('');
    console.log('🔐 Test credentials:');
    console.log('   Vendor: 9876543210 / password123');
    console.log('   Supplier: 9876543211 / password123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  } finally {
    await pool.end();
  }
}

initializeDatabase();