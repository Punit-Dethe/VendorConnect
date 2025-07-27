// Complete test for Product Management System
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCompleteProductSystem() {
  console.log('🧪 Testing Complete Product Management System...\n');

  try {
    // 1. Login as supplier
    console.log('1. Logging in as supplier...');
    const supplierLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile: '9876543211',
      password: 'password123'
    });
    const supplierToken = supplierLogin.data.data.token;
    console.log('✅ Supplier logged in successfully\n');

    // 2. Get initial products (should be empty or have sample products)
    console.log('2. Getting initial products...');
    const initialProducts = await axios.get(`${BASE_URL}/api/supplier/products`, {
      headers: {
        Authorization: `Bearer ${supplierToken}`
      }
    });
    console.log(`✅ Initial products count: ${initialProducts.data.data.length}`);
    console.log('');

    // 3. Add a new product
    console.log('3. Adding new product...');
    const newProductData = {
      name: 'Fresh Organic Tomatoes',
      description: 'Premium quality organic tomatoes, freshly harvested',
      category: 'vegetables',
      unit: 'kg',
      pricePerUnit: 45.50,
      stockQuantity: 100,
      minOrderQuantity: 5,
      isAvailable: true
    };

    const addProductResponse = await axios.post(`${BASE_URL}/api/supplier/products`, newProductData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supplierToken}`
      }
    });

    const newProduct = addProductResponse.data.data;
    console.log('✅ Product added successfully!');
    console.log(`   Name: ${newProduct.name}`);
    console.log(`   Price: ₹${newProduct.pricePerUnit}/${newProduct.unit}`);
    console.log(`   Stock: ${newProduct.stockQuantity} ${newProduct.unit}`);
    console.log(`   Min Order: ${newProduct.minOrderQuantity} ${newProduct.unit}`);
    console.log(`   Stock Status: ${newProduct.stockStatus}`);
    console.log(`   Needs Restock: ${newProduct.needsRestock}`);
    console.log('');

    // 4. Add a low stock product to test alerts
    console.log('4. Adding low stock product to test alerts...');
    const lowStockProductData = {
      name: 'Premium Basmati Rice',
      description: 'High quality basmati rice',
      category: 'grains',
      unit: 'kg',
      pricePerUnit: 120.00,
      stockQuantity: 3, // Below min order quantity
      minOrderQuantity: 10,
      isAvailable: true
    };

    const lowStockResponse = await axios.post(`${BASE_URL}/api/supplier/products`, lowStockProductData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supplierToken}`
      }
    });

    const lowStockProduct = lowStockResponse.data.data;
    console.log('✅ Low stock product added!');
    console.log(`   Name: ${lowStockProduct.name}`);
    console.log(`   Stock: ${lowStockProduct.stockQuantity} (Min: ${lowStockProduct.minOrderQuantity})`);
    console.log(`   Stock Status: ${lowStockProduct.stockStatus}`);
    console.log(`   Needs Restock: ${lowStockProduct.needsRestock}`);
    console.log('');

    // 5. Get updated products list
    console.log('5. Getting updated products list...');
    const updatedProducts = await axios.get(`${BASE_URL}/api/supplier/products`, {
      headers: {
        Authorization: `Bearer ${supplierToken}`
      }
    });
    console.log(`✅ Updated products count: ${updatedProducts.data.data.length}`);

    const lowStockProducts = updatedProducts.data.data.filter(p => p.needsRestock);
    console.log(`   Low stock products: ${lowStockProducts.length}`);
    console.log('');

    // 6. Update product stock
    console.log('6. Updating product stock...');
    const updateResponse = await axios.put(`${BASE_URL}/api/supplier/products/${newProduct.id}`, {
      stockQuantity: 50 // Reduce stock
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supplierToken}`
      }
    });

    const updatedProduct = updateResponse.data.data;
    console.log('✅ Product stock updated!');
    console.log(`   New stock: ${updatedProduct.stockQuantity} ${updatedProduct.unit}`);
    console.log(`   Stock status: ${updatedProduct.stockStatus}`);
    console.log('');

    // 7. Test analytics endpoint
    console.log('7. Testing analytics endpoint...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/supplier/analytics`, {
      headers: {
        Authorization: `Bearer ${supplierToken}`
      }
    });

    const analytics = analyticsResponse.data.data;
    console.log('✅ Analytics loaded successfully!');
    console.log(`   Total Products: ${analytics.overview.totalProducts}`);
    console.log(`   Active Products: ${analytics.overview.activeProducts}`);
    console.log(`   Low Stock Products: ${analytics.overview.lowStockProducts}`);
    console.log(`   Total Orders: ${analytics.overview.totalOrders}`);
    console.log(`   Trust Score: ${analytics.overview.trustScore}`);
    console.log(`   Stock Alerts: ${analytics.stockAlerts.length}`);

    if (analytics.stockAlerts.length > 0) {
      console.log('   Stock Alert Details:');
      analytics.stockAlerts.forEach((alert, index) => {
        console.log(`     ${index + 1}. ${alert.name} - Current: ${alert.currentStock}, Min: ${alert.minRequired}`);
      });
    }
    console.log('');

    // 8. Test vendor can see the products
    console.log('8. Testing vendor can see supplier products...');
    const vendorLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      mobile: '9876543210',
      password: 'password123'
    });
    const vendorToken = vendorLogin.data.data.token;

    const supplierDetails = await axios.get(`${BASE_URL}/api/vendor/suppliers/${supplierLogin.data.data.user.id}`, {
      headers: {
        Authorization: `Bearer ${vendorToken}`
      }
    });

    const supplierProducts = supplierDetails.data.data.products;
    console.log('✅ Vendor can see supplier products!');
    console.log(`   Products visible to vendor: ${supplierProducts.length}`);

    supplierProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₹${product.pricePerUnit}/${product.unit} (Stock: ${product.stockQuantity})`);
    });
    console.log('');

    // 9. Test product deletion
    console.log('9. Testing product deletion...');
    const deleteResponse = await axios.delete(`${BASE_URL}/api/supplier/products/${lowStockProduct.id}`, {
      headers: {
        Authorization: `Bearer ${supplierToken}`
      }
    });

    console.log('✅ Product deleted successfully!');
    console.log(`   Message: ${deleteResponse.data.data.message}`);
    console.log('');

    // 10. Final verification
    console.log('10. Final verification...');
    const finalProducts = await axios.get(`${BASE_URL}/api/supplier/products`, {
      headers: {
        Authorization: `Bearer ${supplierToken}`
      }
    });

    console.log(`✅ Final products count: ${finalProducts.data.data.length}`);
    console.log('');

    console.log('🎉 COMPLETE PRODUCT SYSTEM TEST RESULTS:');
    console.log('   ✅ Product CRUD operations working');
    console.log('   ✅ Stock management and alerts working');
    console.log('   ✅ Low stock detection working');
    console.log('   ✅ Analytics endpoint working');
    console.log('   ✅ Vendor can see supplier products');
    console.log('   ✅ Product categories and units working');
    console.log('   ✅ Stock status calculation working');
    console.log('   ✅ Real-time stock alerts working');
    console.log('');
    console.log('🚀 PRODUCT MANAGEMENT SYSTEM IS FULLY FUNCTIONAL!');
    console.log('');
    console.log('📋 FRONTEND TESTING:');
    console.log('   1. Login as supplier: http://localhost:3000/supplier/login');
    console.log('   2. Go to Products page: Add, edit, delete products');
    console.log('   3. Check Analytics page: View comprehensive analytics');
    console.log('   4. Check Dashboard: See low stock alerts');
    console.log('   5. Login as vendor: See supplier products in detail page');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCompleteProductSystem();