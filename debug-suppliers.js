// Debug script to test supplier registration and listing
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugSuppliers() {
  console.log('🔍 Debugging Supplier Registration and Listing...\n');

  try {
    // 1. Login as vendor first
    console.log('1. Logging in as vendor...');
    const vendorLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile: '9876543210',
      password: 'password123'
    });
    const vendorToken = vendorLogin.data.data.token;
    console.log('✅ Vendor logged in successfully\n');

    // 2. Get current suppliers list
    console.log('2. Getting current suppliers list...');
    const currentSuppliers = await axios.get(`${BASE_URL}/api/vendor/suppliers`, {
      headers: {
        Authorization: `Bearer ${vendorToken}`
      }
    });
    console.log(`✅ Current suppliers count: ${currentSuppliers.data.data.length}`);
    currentSuppliers.data.data.forEach((supplier, index) => {
      console.log(`   ${index + 1}. ${supplier.name} (${supplier.businessType})`);
    });
    console.log('');

    // 3. Register a new supplier
    console.log('3. Registering new supplier...');
    const newSupplierData = {
      name: `Test Supplier ${Date.now()}`,
      mobile: `99999${Math.floor(Math.random() * 10000)}`,
      email: 'test@supplier.com',
      password: 'password123',
      role: 'supplier',
      businessType: 'Test Business',
      address: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    };

    const supplierRegister = await axios.post(`${BASE_URL}/api/auth/register`, newSupplierData);
    console.log('✅ New supplier registered:');
    console.log(`   Name: ${supplierRegister.data.data.user.name}`);
    console.log(`   ID: ${supplierRegister.data.data.user.id}`);
    console.log(`   Trust Score: ${supplierRegister.data.data.user.trustScore}`);
    console.log('');

    // 4. Wait a moment for real-time processing
    console.log('4. Waiting 2 seconds for real-time processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Get updated suppliers list
    console.log('5. Getting updated suppliers list...');
    const updatedSuppliers = await axios.get(`${BASE_URL}/api/vendor/suppliers`, {
      headers: {
        Authorization: `Bearer ${vendorToken}`
      }
    });
    console.log(`✅ Updated suppliers count: ${updatedSuppliers.data.data.length}`);

    // Check if new supplier is in the list
    const newSupplier = updatedSuppliers.data.data.find(s => s.name === newSupplierData.name);
    if (newSupplier) {
      console.log('🎉 NEW SUPPLIER FOUND IN LIST!');
      console.log(`   Name: ${newSupplier.name}`);
      console.log(`   Business: ${newSupplier.businessType}`);
      console.log(`   Trust Score: ${newSupplier.trustScore}`);
      console.log(`   Location: ${newSupplier.location.city}, ${newSupplier.location.state}`);
    } else {
      console.log('❌ NEW SUPPLIER NOT FOUND IN LIST');
      console.log('   Available suppliers:');
      updatedSuppliers.data.data.forEach((supplier, index) => {
        console.log(`   ${index + 1}. ${supplier.name} (${supplier.businessType})`);
      });
    }

    // 6. Show the exact API response structure
    console.log('\n6. API Response Structure:');
    console.log('Raw API response:', JSON.stringify(updatedSuppliers.data, null, 2));

  } catch (error) {
    console.error('❌ Debug failed:', error.response ? error.response.data : error.message);
  }
}

debugSuppliers();