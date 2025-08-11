const { Pool } = require('pg');
require('dotenv').config({ path: '.env.test' });

async function testNewPassword() {
  console.log('🔄 Testing Supabase with new password...');
  console.log('📋 Loading environment from .env.test');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('🔗 Connection string:', connectionString ? 'Loaded successfully' : 'Not found');
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.test');
    return false;
  }

  // Parse connection string to show details (without exposing full password)
  try {
    const url = new URL(connectionString);
    console.log('📊 Connection details:');
    console.log('   - Host:', url.hostname);
    console.log('   - Port:', url.port);
    console.log('   - Database:', url.pathname.substring(1));
    console.log('   - Username:', url.username);
    console.log('   - Password:', url.password ? `${url.password.substring(0, 3)}***` : 'Not set');
  } catch (error) {
    console.error('⚠️  Could not parse connection string:', error.message);
  }

  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to Supabase...');
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name, version() as db_version');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('🗄️  Database:', result.rows[0].db_name);
    console.log('📊 Version:', result.rows[0].db_version.substring(0, 50) + '...');

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

    // Test write permission
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS connection_test (
          id SERIAL PRIMARY KEY,
          test_message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      await client.query(`
        INSERT INTO connection_test (test_message) VALUES ('Test successful at ${new Date().toISOString()}')
      `);
      
      const testResult = await client.query('SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1');
      console.log('✅ Database write test successful!');
      console.log('📝 Test record:', testResult.rows[0].test_message);
      
      // Clean up
      await client.query('DROP TABLE connection_test');
      console.log('🧹 Test table cleaned up');
      
    } catch (writeError) {
      console.log('⚠️  Write test failed (but connection works):', writeError.message);
    }

    client.release();
    await pool.end();
    
    console.log('\n🎉 SUCCESS! Supabase connection is working perfectly!');
    console.log('\n🚀 Next steps:');
    console.log('1. Setup database schema (create tables)');
    console.log('2. Update production environment variables for Vercel');
    console.log('3. Deploy to Vercel');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('🔑 Password authentication failed. Please check:');
      console.error('   - Is the password correct in .env.test?');
      console.error('   - Did you reset the password in Supabase Dashboard?');
    } else if (error.message.includes('SASL')) {
      console.error('🔐 SASL authentication error. This usually means:');
      console.error('   - Database might still be paused');
      console.error('   - Password might still be incorrect');
      console.error('   - Try resetting password again in Supabase');
    } else if (error.message.includes('SSL')) {
      console.error('🔒 SSL connection issue');
    }
    
    await pool.end().catch(() => {});
    return false;
  }
}

testNewPassword();
