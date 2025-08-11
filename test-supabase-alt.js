const { Pool } = require('pg');
require('dotenv').config();

async function testSupabaseAlternative() {
  console.log('🔄 Testing Supabase connection with alternative configuration...');
  
  // Parse connection string manually
  const dbUrl = process.env.DATABASE_URL;
  const url = new URL(dbUrl);
  
  const config = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // Remove leading '/'
    user: url.username,
    password: url.password,
    ssl: {
      rejectUnauthorized: false,
      require: true
    }
  };
  
  console.log('🔗 Connection config:');
  console.log('   - Host:', config.host);
  console.log('   - Port:', config.port);
  console.log('   - Database:', config.database);
  console.log('   - User:', config.user);
  console.log('   - SSL:', 'enabled');

  const pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Supabase successfully!');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('📊 Database:', result.rows[0].db_version.substring(0, 50) + '...');

    // Test schema access
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    console.log('📋 Available schemas:', schemas.rows.map(row => row.schema_name).join(', '));

    // Test table creation permissions
    try {
      await client.query('CREATE TABLE IF NOT EXISTS test_permissions (id SERIAL PRIMARY KEY)');
      await client.query('INSERT INTO test_permissions DEFAULT VALUES');
      const testResult = await client.query('SELECT COUNT(*) FROM test_permissions');
      await client.query('DROP TABLE test_permissions');
      console.log('✅ Database write permissions: OK');
    } catch (permError) {
      console.log('⚠️ Database write permissions: Limited -', permError.message);
    }

    client.release();
    await pool.end();
    
    console.log('🎉 Alternative connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Alternative connection also failed:', error.message);
    console.error('🔍 Full error:', error);
    return false;
  }
}

// Run test if called directly
if (require.main === module) {
  testSupabaseAlternative();
}

module.exports = { testSupabaseAlternative };
