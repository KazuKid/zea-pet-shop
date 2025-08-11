const { Pool } = require('pg');

// Let's debug the connection string components
function debugConnectionString() {
  console.log('🔍 Debugging connection string components...');
  
  const originalPassword = '[5nop31244S!]';
  console.log('🔑 Original password:', originalPassword);
  
  const encodedPassword = encodeURIComponent(originalPassword);
  console.log('🔐 Encoded password:', encodedPassword);
  
  const connectionString = `postgresql://postgres.vzgsuobhmepbrpgikwkz:${encodedPassword}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
  console.log('🔗 Full connection string:');
  console.log(connectionString);
  
  // Parse it back to verify
  try {
    const url = new URL(connectionString);
    console.log('\n✅ Parsed URL components:');
    console.log('   - Protocol:', url.protocol);
    console.log('   - Username:', url.username);
    console.log('   - Password:', decodeURIComponent(url.password));
    console.log('   - Hostname:', url.hostname);
    console.log('   - Port:', url.port);
    console.log('   - Database:', url.pathname.substring(1));
  } catch (error) {
    console.error('❌ URL parsing failed:', error.message);
  }
}

async function testWithDifferentApproaches() {
  debugConnectionString();
  
  console.log('\n🧪 Testing different approaches...');
  
  // Approach 1: Direct connection with individual parameters
  console.log('\n📋 Test 1: Direct parameters (most reliable)...');
  
  const pool1 = new Pool({
    user: 'postgres.vzgsuobhmepbrpgikwkz',
    password: '[5nop31244S!]',  // Raw password
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool1.connect();
    console.log('✅ Direct parameters worked!');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Current time:', result.rows[0].now);
    
    client.release();
    await pool1.end();
    
    console.log('\n🎉 SUCCESS! Direct parameters approach works.');
    console.log('👉 Use this configuration in your api/index.js:');
    console.log(`
const pool = new Pool({
  user: 'postgres.vzgsuobhmepbrpgikwkz',
  password: process.env.SUPABASE_PASSWORD,  // Set this in environment
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Direct parameters failed:', error.message);
    try { await pool1.end(); } catch (e) {}
  }

  // If direct approach fails, there might be an issue with the password itself
  console.log('\n⚠️  Connection failed. Possible issues:');
  console.log('1. 🔑 Password might be incorrect');
  console.log('2. 🏢 Database might be paused (check Supabase dashboard)');
  console.log('3. 🌐 Network/IP restrictions (check Supabase settings)');
  console.log('4. 📍 Wrong region or host');
  
  console.log('\n💡 Please verify in Supabase Dashboard:');
  console.log('   • Settings > Database > Connection info');
  console.log('   • Make sure database is not paused');
  console.log('   • Check if IP restrictions are enabled');
  
  return false;
}

testWithDifferentApproaches();
