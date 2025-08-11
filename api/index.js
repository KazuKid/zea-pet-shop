const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const midtransClient = require('midtrans-client');

// Initialize Express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : { rejectUnauthorized: false }
});

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token akses diperlukan' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' });
      }
      return res.status(403).json({ error: 'Token tidak valid' });
    }
    req.user = decoded;
    next();
  });
};

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage for Vercel
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan!'));
    }
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working on Vercel!', timestamp: new Date().toISOString() });
});

// Setup database tables (ONLY USE ONCE!)
app.get('/api/setup-database', async (req, res) => {
  try {
    // Check if tables already exist
    const checkTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('kategori', 'barang', 'pembeli', 'orders', 'order_items')
    `);

    if (checkTables.rows.length >= 5) {
      return res.json({ 
        success: true, 
        message: 'Database already setup', 
        tables: checkTables.rows.map(row => row.table_name)
      });
    }

    // Create tables
    await pool.query(`
      -- 1. Tabel Kategori
      CREATE TABLE IF NOT EXISTS kategori (
        id_kategori SERIAL PRIMARY KEY,
        nama_kategori VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 2. Tabel Barang
      CREATE TABLE IF NOT EXISTS barang (
        id_barang SERIAL PRIMARY KEY,
        nama_barang VARCHAR(255) NOT NULL,
        harga INTEGER NOT NULL,
        stok_barang INTEGER NOT NULL DEFAULT 0,
        gambar_barang TEXT,
        id_kategori INTEGER REFERENCES kategori(id_kategori) ON DELETE CASCADE,
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 3. Tabel Pembeli
      CREATE TABLE IF NOT EXISTS pembeli (
        id_pembeli SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nama_pembeli VARCHAR(255),
        negara_pembeli VARCHAR(100),
        provinsi_pembeli VARCHAR(100),
        kota_pembeli VARCHAR(100),
        alamat1_pembeli TEXT,
        kode_pos VARCHAR(10),
        ktp_pembeli VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 4. Tabel Orders
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) UNIQUE NOT NULL,
        id_pembeli INTEGER REFERENCES pembeli(id_pembeli) ON DELETE CASCADE,
        total_amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_type VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 5. Tabel Order Items
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(order_id) ON DELETE CASCADE,
        id_barang INTEGER REFERENCES barang(id_barang) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default categories
    await pool.query(`
      INSERT INTO kategori (nama_kategori) VALUES 
      ('Makanan Kucing'),
      ('Makanan Anjing'),
      ('Aksesori'),
      ('Mainan'),
      ('Perawatan'),
      ('Kandang')
      ON CONFLICT DO NOTHING;
    `);

    // Insert admin user (password: admin123)
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO pembeli (
        username, password, nama_pembeli, negara_pembeli, 
        provinsi_pembeli, kota_pembeli, alamat1_pembeli
      ) VALUES (
        'admin', $1, 'Administrator', 'Indonesia',
        'DKI Jakarta', 'Jakarta Pusat', 'Jl. Admin No. 1'
      ) ON CONFLICT (username) DO NOTHING;
    `, [hashedAdminPassword]);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(id_kategori);
      CREATE INDEX IF NOT EXISTS idx_orders_pembeli ON orders(id_pembeli);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_barang ON order_items(id_barang);
    `);

    res.json({ 
      success: true, 
      message: 'Database setup completed successfully!',
      admin_credentials: {
        username: 'admin',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'Make sure DATABASE_URL is correctly set in environment variables'
    });
  }
});

// Categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kategori ORDER BY nama_kategori');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, k.nama_kategori 
      FROM barang p 
      LEFT JOIN kategori k ON p.id_kategori = k.id_kategori 
      ORDER BY p.nama_barang
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const result = await pool.query('SELECT * FROM pembeli WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { 
        id: user.id_pembeli, 
        username: user.username,
        role: user.username === 'admin' ? 'admin' : 'user'
      },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id_pembeli,
        username: user.username,
        nama_pembeli: user.nama_pembeli,
        role: user.username === 'admin' ? 'admin' : 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Register endpoint  
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nama_pembeli, negara_pembeli, provinsi_pembeli, kota_pembeli, alamat1_pembeli, kode_pos, ktp_pembeli } = req.body;
    
    // Check if username already exists
    const existingUser = await pool.query('SELECT username FROM pembeli WHERE username = $1', [username]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO pembeli (username, password, nama_pembeli, negara_pembeli, provinsi_pembeli, kota_pembeli, alamat1_pembeli, kode_pos, ktp_pembeli) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_pembeli, username, nama_pembeli`,
      [username, hashedPassword, nama_pembeli, negara_pembeli, provinsi_pembeli, kota_pembeli, alamat1_pembeli, kode_pos, ktp_pembeli]
    );

    const token = jwt.sign(
      { 
        id: result.rows[0].id_pembeli, 
        username: result.rows[0].username,
        role: 'user'
      },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Export the Express app as a serverless function
module.exports = app;
