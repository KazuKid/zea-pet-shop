const axios = require('axios');

// Test production API endpoints
const VERCEL_URL = 'https://zea-pet-shop.vercel.app';

async function testAPI() {
  console.log('🧪 Testing Zea Pet Shop Deployment...\n');
  console.log(`🌐 Testing URL: ${VERCEL_URL}\n`);
  
  try {
    // Test 1: Basic API
    console.log('1. Testing basic API endpoint...');
    const testResponse = await axios.get(`${VERCEL_URL}/api/test`);
    console.log('✅ Basic API working:', testResponse.data.message);
    console.log('   Version:', testResponse.data.version);
    console.log('   Available endpoints:', testResponse.data.endpoints.length);
    
    // Test 2: Database connection
    console.log('\n2. Testing database connection...');
    try {
      const dbResponse = await axios.get(`${VERCEL_URL}/api/test-db`);
      console.log('✅ Database connection:', dbResponse.data.success ? 'SUCCESS' : 'FAILED');
      console.log('   Tables found:', dbResponse.data.tables_found);
      console.log('   Record counts:', dbResponse.data.record_counts);
      console.log('   Environment check:', dbResponse.data.environment);
    } catch (dbError) {
      console.log('❌ Database connection failed:', dbError.response?.status);
      console.log('   Error:', dbError.response?.data?.error || dbError.message);
    }
    
    // Test 3: Midtrans configuration
    console.log('\n3. Testing Midtrans configuration...');
    try {
      const midtransResponse = await axios.get(`${VERCEL_URL}/api/test-midtrans`);
      console.log('✅ Midtrans config:', midtransResponse.data.success ? 'SUCCESS' : 'FAILED');
      console.log('   Environment:', midtransResponse.data.config?.environment);
      console.log('   Keys configured:', {
        server: midtransResponse.data.config?.hasServerKey,
        client: midtransResponse.data.config?.hasClientKey
      });
    } catch (midtransError) {
      console.log('❌ Midtrans config failed:', midtransError.response?.status);
      console.log('   Error:', midtransError.response?.data?.error || midtransError.message);
    }
    
    // Test 4: Product categories
    console.log('\n4. Testing categories endpoint...');
    try {
      const categoriesResponse = await axios.get(`${VERCEL_URL}/api/categories`);
      console.log('✅ Categories endpoint working');
      console.log('   Categories found:', categoriesResponse.data.length);
    } catch (catError) {
      console.log('❌ Categories failed:', catError.response?.status);
    }
    
    // Test 5: Products
    console.log('\n5. Testing products endpoint...');
    try {
      const productsResponse = await axios.get(`${VERCEL_URL}/api/products`);
      console.log('✅ Products endpoint working');
      console.log('   Products found:', productsResponse.data.length);
    } catch (prodError) {
      console.log('❌ Products failed:', prodError.response?.status);
    }
    
    // Test 6: Login endpoint
    console.log('\n6. Testing login endpoint...');
    try {
      const loginResponse = await axios.post(`${VERCEL_URL}/api/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        console.log('   Token received:', !!loginResponse.data.token);
        console.log('   User role:', loginResponse.data.user?.role);
        console.log('   Admin name:', loginResponse.data.user?.nama_pembeli);
      }
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.status);
      console.log('   Error:', loginError.response?.data?.error || loginError.message);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('   Visit the website: ' + VERCEL_URL);
    console.log('   Admin login: username=admin, password=admin123');
    console.log('   User login: username=user1, password=user123');
    
  } catch (error) {
    console.error('❌ Critical error during testing:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
