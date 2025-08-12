// Test login langsung ke production
const axios = require('axios');

async function testProductionLogin() {
  console.log('🔍 Testing Production Login...\n');
  
  const PRODUCTION_URL = 'https://zea-pet-shop.vercel.app';
  
  try {
    console.log('1. Testing basic API...');
    const testResponse = await axios.get(`${PRODUCTION_URL}/api/test`);
    console.log('✅ API Status:', testResponse.data.message);
    
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${PRODUCTION_URL}/api/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('🎉 LOGIN SUCCESS!');
      console.log('   Token received:', !!loginResponse.data.token);
    }
    
  } catch (error) {
    console.error('❌ Login FAILED:');
    console.error('   Status:', error.response?.status);
    console.error('   Error:', error.response?.data?.error);
    
    if (error.response?.status === 401) {
      console.log('\n💡 SOLUSI:');
      console.log('   Environment variables belum ter-set di Vercel Dashboard');
      console.log('   Buka: https://vercel.com/dashboard → zea-pet-shop → Settings → Environment Variables');
    }
  }
}

testProductionLogin();
