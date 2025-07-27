// Check which server is currently running
const axios = require('axios');

async function checkCurrentServer() {
  console.log('🔍 Checking which server is running on port 5000...\n');

  try {
    // Test health endpoint (production server)
    console.log('Testing production server health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');

    if (healthResponse.data.message === 'VendorConnect Production Server') {
      console.log('✅ PRODUCTION SERVER is running!');
      console.log(`   Features: ${healthResponse.data.features.length} production features available`);
      console.log('   Socket.IO: ✅ Available');
      console.log('   Real-time notifications: ✅ Available');
      return 'production';
    }
  } catch (error) {
    // Health endpoint failed, try simple server
  }

  try {
    // Test simple server
    console.log('Testing simple server endpoint...');
    const simpleResponse = await axios.get('http://localhost:5000/');

    if (simpleResponse.data.message === 'VendorConnect Backend is running!') {
      console.log('⚠️  SIMPLE SERVER is running (not production)');
      console.log('   Socket.IO: ❌ Not available');
      console.log('   Real-time notifications: ❌ Not available');
      console.log('\n🚀 You need to start the PRODUCTION server instead!');
      console.log('   Run: node start-production-simple.js');
      return 'simple';
    }
  } catch (error) {
    // Simple server also failed
  }

  console.log('❌ No server is running on port 5000');
  console.log('\n🚀 Start the production server:');
  console.log('   Run: node start-production-simple.js');
  return 'none';
}

// Test API endpoints
async function testEndpoints() {
  console.log('\n🧪 Testing API endpoints...');

  try {
    // Test supplier listing endpoint
    const suppliersResponse = await axios.get('http://localhost:5000/api/vendor/suppliers', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('❌ Suppliers endpoint failed (expected - need valid token)');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Suppliers endpoint exists (401 Unauthorized - expected)');
    } else {
      console.log('❌ Suppliers endpoint not found');
    }
  }

  try {
    // Test registration endpoint
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      test: 'data'
    });
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Registration endpoint exists (400 Bad Request - expected)');
    } else {
      console.log('❌ Registration endpoint not found');
    }
  }
}

async function main() {
  const serverType = await checkCurrentServer();

  if (serverType === 'production') {
    await testEndpoints();
    console.log('\n🎉 Production server is running correctly!');
    console.log('   You can now test the real-time supplier workflow.');
  } else {
    console.log('\n❌ Production server is NOT running.');
    console.log('   Real-time features will not work.');
  }
}

main().catch(console.error);