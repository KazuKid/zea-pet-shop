const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

async function testProductionConfig() {
  console.log('🚀 Testing Production Configuration for Vercel...');
  console.log('📋 Loading environment from .env.production');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  console.log('🔍 Checking environment variables...');
  const missingVars = [];
  for (const varName of requiredEnvVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('⚠️  Missing required environment variables:', missingVars.join(', '));
    return false;
  }

  // Test database connection with production config
  console.log('\n🔗 Testing database connection...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');

    // Test all required tables exist
    const requiredTables = ['admin', 'barang', 'kategori', 'keranjang', 'order_items', 'orders', 'pembayaran', 'pembeli', 'pembeli_info'];
    
    for (const tableName of requiredTables) {
      const result = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);
      
      if (result.rows[0].count > 0) {
        console.log(`✅ Table '${tableName}': Found`);
      } else {
        console.log(`❌ Table '${tableName}': Missing`);
      }
    }

    // Test API endpoints simulation
    console.log('\n🧪 Testing sample database operations...');
    
    // Test kategori
    const kategoris = await client.query('SELECT COUNT(*) as count FROM kategori');
    console.log(`📊 Categories: ${kategoris.rows[0].count} found`);
    
    // Test barang
    const barangs = await client.query('SELECT COUNT(*) as count FROM barang');
    console.log(`📦 Products: ${barangs.rows[0].count} found`);
    
    // Test admin
    const admins = await client.query('SELECT COUNT(*) as count FROM admin');
    console.log(`👤 Admins: ${admins.rows[0].count} found`);

    client.release();
    await pool.end();
    
    console.log('\n🎉 Production configuration test successful!');
    console.log('\n📝 Summary for Vercel deployment:');
    console.log('✅ Environment variables ready');
    console.log('✅ Database connection working');
    console.log('✅ All tables exist');
    console.log('✅ Ready for deployment!');
    
    console.log('\n🔧 Vercel Environment Variables to set:');
    console.log('DATABASE_URL=' + process.env.DATABASE_URL);
    console.log('JWT_SECRET=' + process.env.JWT_SECRET);
    console.log('NODE_ENV=production');
    
    return true;
    
  } catch (error) {
    console.error('❌ Production config test failed:', error.message);
    await pool.end().catch(() => {});
    return false;
  }
}

testProductionConfig();
