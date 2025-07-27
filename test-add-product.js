// Test adding a product as supplier
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAddProduct() {
  console.log('🧪 Testing Add Product API...\n');

  try {
    // 1. Login as supplier
    console.log('1. Logging in as supplier...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile: '9876543211',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Supplier logged in successfully');
    console.log(`   User: ${loginResponse.data.data.user.name}`);
    console.log(`   Role: ${loginResponse.data.data.user.role}`);
    console.log('');

    // 2. Test adding a product
    console.log('2. Adding a test product...');
    const productData = {
      name: 'Test Fresh Tomatoes',
      description: 'Premium quality organic tomatoes for testing',
      category: 'vegetables',
      unit: 'kg',
      pricePerUnit: 45.50,
      stockQuantity: 100,
      minOrderQuantity: 5
    };

    console.log('   Product data:', JSON.stringify(productData, null, 2));

    const addResponse = await axios.post(`${BASE_URL}/api/supplier/products`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (addResponse.data.success) {
      console.log('✅ Product added successfully!');
      console.log('   Product details:');
      console.log(`     ID: ${addResponse.data.data.id}`);
      console.log(`     Name: ${addResponse.data.data.name}`);
      console.log(`     Price: ₹${addResponse.data.data.pricePerUnit}/${addResponse.data.data.unit}`);
      console.log(`     Stock: ${addResponse.data.data.stockQuantity} ${addResponse.data.data.unit}`);
      console.log(`     Min Order: ${addResponse.data.data.minOrderQuantity} ${addResponse.data.data.unit}`);
      console.log(`     Available: ${addResponse.data.data.isAvailable}`);
      console.log(`     Stock Status: ${addResponse.data.data.stockStatus}`);
      console.log(`     Needs Restock: ${addResponse.data.data.needsRestock}`);
    } else {
      console.error('❌ Failed to add product:', addResponse.data);
    }

    // 3. Get all products to verify
    console.log('');
    console.log('3. Fetching all products to verify...');
    const getResponse = await axios.get(`${BASE_URL}/api/supplier/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getResponse.data.success) {
      console.log(`✅ Found ${getResponse.data.data.length} products`);
      getResponse.data.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ₹${product.pricePerUnit}/${product.unit} (Stock: ${product.stockQuantity})`);
      });
    } else {
      console.error('❌ Failed to fetch products:', getResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAddProduct();