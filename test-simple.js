const { Pool } = require('pg');

async function testSupabaseSimple() {
  console.log('🔄 Testing Supabase connection - Simple approach...');
  
  // Test 1: Basic connection string
  console.log('\n📋 Test 1: Basic connection string...');
  const connectionString = `postgresql://postgres.vzgsuobhmepbrpgikwkz:%5B5nop31244S%21%5D@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
  
  let pool = new Pool({
    connectionString: connectionString,
    ssl: false  // Try without SSL first
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected without SSL!');
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Without SSL failed:', error.message);
    try { await pool.end(); } catch (e) {}
  }

  // Test 2: With SSL
  console.log('\n📋 Test 2: With SSL enabled...');
  pool = new Pool({
    connectionString: connectionString,
    ssl: true
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected with SSL!');
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ With SSL failed:', error.message);
    try { await pool.end(); } catch (e) {}
  }

  // Test 3: Manual config
  console.log('\n📋 Test 3: Manual configuration...');
  pool = new Pool({
    user: 'postgres.vzgsuobhmepbrpgikwkz',
    password: '[5nop31244S!]',
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres'
  });

  try {
    const client = await pool.connect();
    console.log('✅ Manual config worked!');
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Manual config failed:', error.message);
    try { await pool.end(); } catch (e) {}
  }

  console.log('\n⚠️  All tests failed. Kemungkinan masalah:');
  console.log('1. Password salah - cek di Supabase dashboard');
  console.log('2. Database di-pause - perlu di-resume');
  console.log('3. IP tidak diizinkan - cek network restrictions');
  console.log('\nSilakan cek kembali setting di Supabase dashboard Anda.');
  
  return false;
}

testSupabaseSimple();
