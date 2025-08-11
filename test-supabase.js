const { Pool } = require('pg');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  // Konfigurasi pool yang benar untuk Supabase
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');
    console.log('🔗 Connection details:');
    console.log('   - Host:', client.host);
    console.log('   - Port:', client.port);
    console.log('   - Database:', client.database);

    // Test query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version.substring(0, 50) + '...');

    // Test table existence
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Existing tables:', tables.rows.map(row => row.table_name).join(', '));
    } else {
      console.log('📋 No custom tables found (this is normal for new database)');
    }

    // Test if we can create a simple table
    await client.query('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    await client.query('DROP TABLE IF EXISTS test_connection');
    console.log('✅ Database write permissions verified');

    client.release();
    await pool.end();
    
    console.log('🎉 Database connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('� Error details:');
    console.error('   - Error code:', error.code);
    console.error('   - Error name:', error.name);
    
    if (error.message.includes('SSL')) {
      console.error('�💡 SSL Error Solution:');
      console.error('   1. Make sure you are using the correct Supabase connection string');
      console.error('   2. Use the "Connection pooling" URL from Supabase Dashboard > Settings > Database');
      console.error('   3. Your connection string should look like:');
      console.error('      postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
    } else if (error.message.includes('password authentication failed')) {
      console.error('💡 Password Error Solution:');
      console.error('   1. Check your database password in Supabase Dashboard > Settings > Database');
      console.error('   2. Make sure there are no special characters causing issues');
      console.error('   3. Try resetting your database password');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 Database Error Solution:');
      console.error('   1. Make sure you are using the correct project reference');
      console.error('   2. Check that your Supabase project is active');
    }
    
    return false;
  }
}

// Run test if called directly
if (require.main === module) {
  testSupabaseConnection();
}

module.exports = { testSupabaseConnection };
