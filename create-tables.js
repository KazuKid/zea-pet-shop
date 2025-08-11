const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres', 
  password: 'snoper44',
  database: 'PetShopZea',
  port: 5432
});

async function createTables() {
  const client = await pool.connect();
  try {
    // Tabel orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) UNIQUE NOT NULL,
        id_pembeli INTEGER REFERENCES pembeli(id_pembeli),
        total_amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabel order_items  
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(order_id),
        id_barang INTEGER REFERENCES barang(id_barang),
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL
      )
    `);
    
    console.log('Tabel orders dan order_items berhasil dibuat!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

createTables();
