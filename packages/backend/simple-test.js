// Simple test to check supplier registration and listing
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSupplierRegistration() {
  console.log('🧪 Testing Supplier Registration and Listing...\n');

  try {
    // 1. Test server health
    console.log('1. Checking server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    console.log(`   Features: ${health.data.features.length} features available\n`);

    // 2. Register a new supplier
    console.log('2. Registering new supplier...');
    const supplierData = {
      name: 'Test Supplier',
      mobile: '9999999999',
      email: 'test@supplier.com',
      password: 'password123',
      role: 'supplier',
      businessType: 'Test Business',
      address: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    };

    const supplierRegister = await axios.post(`${BASE_URL}/api/auth/register`, supplierData);
    console.log('✅ Supplier registered successfully');
    console.log(`   Name: ${supplierRegister.data.data.user.name}`);
    console.log(`   Trust Score: ${supplierRegister.data.data.user.trustScore}\n`);

    // 3. Login as vendor to check suppliers list
    console.log('3. Testing vendor login...');
    const vendorLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile: '9876543210',
      password: 'password123'
    });
    console.log('✅ Vendor login successful\n');

    // 4. Get suppliers list
    console.log('4. Fetching suppliers list...');
    const suppliers = await axios.get(`${BASE_URL}/api/vendor/suppliers`, {
      headers: {
        Authorization: `Bearer ${vendorLogin.data.data.token}`
      }
    });
    console.log('✅ Suppliers fetched successfully');
    console.log(`   Total suppliers: ${suppliers.data.data.length}`);

    // Check if our new supplier is in the list
    const newSupplier = suppliers.data.data.find(s => s.name === 'Test Supplier');
    if (newSupplier) {
      console.log('✅ New supplier found in list!');
      console.log(`   Name: ${newSupplier.name}`);
      console.log(`   Business: ${newSupplier.businessType}`);
      console.log(`   Trust Score: ${newSupplier.trustScore}`);
    } else {
      console.log('❌ New supplier NOT found in list');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testSupplierRegistration();