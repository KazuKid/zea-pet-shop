const { Pool } = require('pg');

async function testSupabaseSSLFix() {
  console.log('🔄 Testing Supabase with proper SSL configuration...');
  
  const connectionString = `postgresql://postgres.vzgsuobhmepbrpgikwkz:%5B5nop31244S%21%5D@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`;
  
  console.log('📋 Connection details:');
  console.log('   - Host: aws-0-ap-southeast-1.pooler.supabase.com');
  console.log('   - Port: 6543');
  console.log('   - Database: postgres');
  console.log('   - User: postgres.vzgsuobhmepbrpgikwkz');
  console.log('   - SSL: Required with certificate verification disabled');

  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false  // Ini yang penting untuk Supabase
    }
  });

  try {
    console.log('🔗 Connecting to Supabase...');
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('🗄️  Database name:', result.rows[0].db_name);

    // Check existing tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Existing tables:', tables.rows.map(row => row.table_name).join(', '));
    } else {
      console.log('📋 No custom tables found - database is ready for initial setup');
    }

    // Test if we can create a simple table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS test_connection (
          id SERIAL PRIMARY KEY,
          message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await client.query(`
        INSERT INTO test_connection (message) VALUES ('Connection test successful')
      `);
      
      const testResult = await client.query('SELECT * FROM test_connection LIMIT 1');
      console.log('✅ Database write test successful:', testResult.rows[0].message);
      
      // Clean up test table
      await client.query('DROP TABLE test_connection');
      console.log('🧹 Test table cleaned up');
      
    } catch (err) {
      console.log('⚠️  Database write test failed (but connection works):', err.message);
    }

    client.release();
    await pool.end();
    
    console.log('\n🎉 Supabase connection fully working!');
    console.log('\n✅ Your working connection string:');
    console.log(connectionString);
    
    console.log('\n🔧 For your api/index.js, use this configuration:');
    console.log(`const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Full error:', error);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Password authentication failed. Please:');
      console.error('   1. Go to Supabase Dashboard > Settings > Database');
      console.error('   2. Reset your database password');
      console.error('   3. Make sure to copy the new password exactly');
    }
    
    return false;
  }
}

testSupabaseSSLFix();
