const {
  Pool
} = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vendor_supplier_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function setupDatabase() {
  const pool = new Pool(dbConfig);

  try {
    console.log('🔧 Setting up VendorConnect Database...');

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // The enhanced server will create tables automatically
    console.log('✅ Database setup complete!');
    console.log('');
    console.log('🚀 You can now start the server with:');
    console.log('   npm run dev');
    console.log('');
    console.log('🌍 Features enabled:');
    console.log('   - Database persistence');
    console.log('   - Region-wise supplier selection');
    console.log('   - Automatic location detection');
    console.log('   - Distance-based recommendations');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('');
    console.log('💡 Make sure PostgreSQL is running and check your configuration:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log('');
    console.log('🔧 To create the database:');
    console.log(`   createdb ${dbConfig.database}`);
  } finally {
    await pool.end();
  }
}

setupDatabase();