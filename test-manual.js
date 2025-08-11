const { Pool } = require('pg');

async function testSupabaseManual() {
  console.log('🔄 Testing Supabase connection with manual config...');
  
  // Konfigurasi manual berdasarkan informasi Supabase Anda
  const config = {
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.vzgsuobhmepbrpgikwkz',
    password: '[5nop31244S!]', // Password asli tanpa encoding
    ssl: {
      rejectUnauthorized: false
    }
  };
  
  console.log('🔗 Connection config:');
  console.log('   - Host:', config.host);
  console.log('   - Port:', config.port);
  console.log('   - Database:', config.database);
  console.log('   - User:', config.user);
  console.log('   - SSL: enabled');

  const pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('📊 Database:', result.rows[0].db_version.substring(0, 50) + '...');

    // Test table listing
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Existing tables:', tables.rows.map(row => row.table_name).join(', '));
    } else {
      console.log('📋 No custom tables found (database is ready for setup)');
    }

    client.release();
    await pool.end();
    
    console.log('🎉 Manual connection test completed successfully!');
    
    // Show correct connection string format
    console.log('\n✅ Your correct connection string should be:');
    const encodedPassword = encodeURIComponent('[5nop31244S!]');
    const correctConnectionString = `postgresql://postgres.vzgsuobhmepbrpgikwkz:${encodedPassword}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
    console.log(correctConnectionString);
    
    return true;
  } catch (error) {
    console.error('❌ Manual connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('💡 Password might be wrong. Please check:');
      console.error('   1. Go to Supabase Dashboard > Settings > Database');
      console.error('   2. Check your database password');
      console.error('   3. Try resetting the password if needed');
    } else if (error.message.includes('SSL')) {
      console.error('💡 SSL configuration issue. Try different SSL settings.');
    }
    
    return false;
  }
}

// Run test
testSupabaseManual();
