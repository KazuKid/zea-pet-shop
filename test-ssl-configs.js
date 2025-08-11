const { Pool } = require('pg');

async function testSupabaseSASL() {
  console.log('🔄 Testing Supabase with different SSL configurations...');
  
  const configs = [
    {
      name: 'Config 1: SSL require',
      config: {
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.vzgsuobhmepbrpgikwkz',
        password: '[5nop31244S!]',
        ssl: {
          rejectUnauthorized: false,
          require: true
        }
      }
    },
    {
      name: 'Config 2: SSL prefer',
      config: {
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.vzgsuobhmepbrpgikwkz',
        password: '[5nop31244S!]',
        ssl: 'prefer'
      }
    },
    {
      name: 'Config 3: Connection string with encoded password',
      connectionString: `postgresql://postgres.vzgsuobhmepbrpgikwkz:${encodeURIComponent('[5nop31244S!]')}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`
    }
  ];

  for (const testConfig of configs) {
    console.log(`\n📋 Testing ${testConfig.name}...`);
    
    const pool = testConfig.connectionString 
      ? new Pool({ connectionString: testConfig.connectionString })
      : new Pool(testConfig.config);

    try {
      const client = await pool.connect();
      console.log('✅ Connection successful!');

      const result = await client.query('SELECT NOW() as current_time');
      console.log('⏰ Current time:', result.rows[0].current_time);

      client.release();
      await pool.end();
      
      console.log(`🎉 ${testConfig.name} worked!`);
      return true;
      
    } catch (error) {
      console.error(`❌ ${testConfig.name} failed:`, error.message);
      try {
        await pool.end();
      } catch (e) {
        // ignore
      }
    }
  }
  
  console.log('\n⚠️  All configurations failed. The issue might be:');
  console.log('1. Wrong password - please check your Supabase dashboard');
  console.log('2. Database is paused - check if it needs to be resumed');
  console.log('3. Network/firewall issues');
  
  return false;
}

// Run test
testSupabaseSASL();
