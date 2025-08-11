const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const midtransClient = require('midtrans-client');
require('dotenv').config();

const app = express();

// CORS Configuration for Production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'snoper44',
  database: process.env.DB_NAME || 'PetShopZea',
  port: process.env.DB_PORT || 5432,
});

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true', // Dynamic production mode
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Konfigurasi penyimpanan file gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public'); // simpan di folder public
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // nama unik
  }
});
const upload = multer({ storage: storage });

app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD Produk (barang)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM barang ORDER BY id_barang');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint upload gambar
app.post('/api/upload', upload.single('gambar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename });
});

// Endpoint kategori
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kategori ORDER BY id_kategori');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', upload.single('gambar_barang'), async (req, res) => {
  const { nama_barang, harga, stok_barang, id_kategori, deskripsi } = req.body;
  const gambar_barang = req.file ? req.file.filename : null;
  
  try {
    const result = await pool.query(
      'INSERT INTO barang (nama_barang, harga, stok_barang, gambar_barang, id_kategori, deskripsi) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nama_barang, harga, stok_barang, gambar_barang, id_kategori, deskripsi]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', upload.single('gambar_barang'), async (req, res) => {
  const { id } = req.params;
  const { nama_barang, harga, stok_barang, id_kategori, deskripsi } = req.body;
  
  try {
    // Jika ada file baru yang diupload, gunakan file baru, jika tidak tetap gunakan gambar lama
    let gambar_barang;
    if (req.file) {
      gambar_barang = req.file.filename;
    } else {
      // Ambil gambar lama dari database
      const currentProduct = await pool.query('SELECT gambar_barang FROM barang WHERE id_barang=$1', [id]);
      gambar_barang = currentProduct.rows[0]?.gambar_barang || null;
    }
    
    const result = await pool.query(
      'UPDATE barang SET nama_barang=$1, harga=$2, stok_barang=$3, gambar_barang=$4, id_kategori=$5, deskripsi=$6 WHERE id_barang=$7 RETURNING *',
      [nama_barang, harga, stok_barang, gambar_barang, id_kategori, deskripsi, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM barang WHERE id_barang=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint register pembeli
app.post('/api/register', async (req, res) => {
  const {
    username, password, nama, email, no_hp, alamat, negara, provinsi, kota, kode_pos
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Insert ke tabel pembeli
    const pembeliResult = await client.query(
      'INSERT INTO pembeli (username, password) VALUES ($1, $2) RETURNING id_pembeli',
      [username, password]
    );
    const id_pembeli = pembeliResult.rows[0].id_pembeli;
    // Insert ke tabel pembeli_info
    await client.query(
      'INSERT INTO pembeli_info (id_pembeli, nama_pembeli, negara_pembeli, provinsi_pembeli, kota_pembeli, alamat1_pembeli, kode_pos, ktp_pembeli) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id_pembeli, nama, negara, provinsi, kota, alamat, kode_pos, '']
    );
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

// Endpoint login untuk menghasilkan token
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Cek di tabel admin
    const adminResult = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      if (admin.password.trim() === password.trim()) {
        const user = { username: admin.username, role: 'admin' };
        const accessToken = jwt.sign(user, SECRET_KEY, { expiresIn: '8h' }); // Extended to 8 hours
        return res.json({ success: true, token: accessToken, role: 'admin', username: user.username });
      }
    }

    // 2. Jika bukan admin, cek di tabel pembeli
    const pembeliResult = await pool.query('SELECT * FROM pembeli WHERE username = $1', [username]);

    if (pembeliResult.rows.length > 0) {
      const pembeli = pembeliResult.rows[0];
      if (pembeli.password.trim() === password.trim()) {
        const user = { username: pembeli.username, role: 'user' };
        const accessToken = jwt.sign(user, SECRET_KEY, { expiresIn: '8h' }); // Extended to 8 hours
        return res.json({ success: true, token: accessToken, role: 'user', username: user.username });
      }
    }

    // 3. Jika tidak ditemukan di kedua tabel atau password salah
    return res.status(401).json({ success: false, message: 'Username atau password salah' });

  } catch (err) {
    console.error('Error saat login:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Middleware untuk memvalidasi token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token:', token);

  if (!token) {
    console.log('Token tidak ditemukan');
    return res.status(401).json({ 
      success: false,
      message: 'Token tidak ditemukan',
      requireLogin: true 
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Token tidak valid:', err.message);
      
      // Check if token has invalid signature (due to secret key change)
      if (err.name === 'JsonWebTokenError' && err.message.includes('invalid signature')) {
        return res.status(401).json({ 
          success: false,
          message: 'Token signature invalid - please login again',
          signatureInvalid: true,
          requireLogin: true 
        });
      }
      
      // Check if token is expired
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired',
          expired: true,
          requireLogin: true 
        });
      }
      
      return res.status(403).json({ 
        success: false,
        message: 'Token tidak valid: ' + err.message,
        requireLogin: true 
      });
    }
    
    console.log('User authenticated:', user);
    req.user = user;
    next();
  });
};

// Endpoint untuk refresh token
app.post('/api/refresh-token', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Generate new token with extended expiry
    const newToken = jwt.sign(
      { username: user.username, role: user.role }, 
      SECRET_KEY, 
      { expiresIn: '8h' }
    );
    
    res.json({ 
      success: true, 
      token: newToken,
      message: 'Token refreshed successfully' 
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ success: false, message: 'Error refreshing token' });
  }
});

// ===== ENDPOINT CRUD PEMBELI UNTUK ADMIN =====

// GET semua pembeli (dengan join ke pembeli_info)
app.get('/api/buyers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_pembeli,
        p.username,
        pi.nama_pembeli,
        pi.negara_pembeli,
        pi.provinsi_pembeli,
        pi.kota_pembeli,
        pi.alamat1_pembeli,
        pi.kode_pos,
        pi.ktp_pembeli
      FROM pembeli p
      LEFT JOIN pembeli_info pi ON p.id_pembeli = pi.id_pembeli
      ORDER BY p.id_pembeli
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching buyers:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update pembeli
app.put('/api/buyers/:id', async (req, res) => {
  const { id } = req.params;
  const {
    username,
    password,
    nama_pembeli,
    negara_pembeli,
    provinsi_pembeli,
    kota_pembeli,
    alamat1_pembeli,
    kode_pos,
    ktp_pembeli
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update tabel pembeli
    if (password && password.trim() !== '') {
      await client.query(
        'UPDATE pembeli SET username = $1, password = $2 WHERE id_pembeli = $3',
        [username, password, id]
      );
    } else {
      await client.query(
        'UPDATE pembeli SET username = $1 WHERE id_pembeli = $2',
        [username, id]
      );
    }

    // Update tabel pembeli_info
    await client.query(
      `UPDATE pembeli_info SET 
        nama_pembeli = $1,
        negara_pembeli = $2,
        provinsi_pembeli = $3,
        kota_pembeli = $4,
        alamat1_pembeli = $5,
        kode_pos = $6,
        ktp_pembeli = $7
      WHERE id_pembeli = $8`,
      [nama_pembeli, negara_pembeli, provinsi_pembeli, kota_pembeli, alamat1_pembeli, kode_pos, ktp_pembeli, id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Data pembeli berhasil diperbarui' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating buyer:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// DELETE pembeli
app.delete('/api/buyers/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hapus dari pembeli_info terlebih dahulu (karena foreign key)
    await client.query('DELETE FROM pembeli_info WHERE id_pembeli = $1', [id]);
    
    // Hapus dari keranjang jika ada
    await client.query('DELETE FROM keranjang WHERE id_pembeli = $1', [id]);
    
    // Hapus dari orders jika ada
    await client.query('DELETE FROM orders WHERE id_pembeli = $1', [id]);
    
    // Hapus dari pembeli
    await client.query('DELETE FROM pembeli WHERE id_pembeli = $1', [id]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Pembeli berhasil dihapus' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting buyer:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// ===== END ENDPOINT CRUD PEMBELI =====

// ===== ENDPOINT CRUD PESANAN UNTUK ADMIN =====

// GET semua pesanan dengan detail pembeli dan items
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.order_id,
        o.id_pembeli,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        pi.nama_pembeli,
        p.username,
        (
          SELECT json_agg(
            json_build_object(
              'id_barang', oi.id_barang,
              'quantity', oi.quantity,
              'price', oi.price,
              'nama_barang', b.nama_barang
            )
          )
          FROM order_items oi
          JOIN barang b ON oi.id_barang = b.id_barang
          WHERE oi.order_id = o.order_id
        ) as items
      FROM orders o
      JOIN pembeli p ON o.id_pembeli = p.id_pembeli
      LEFT JOIN pembeli_info pi ON p.id_pembeli = pi.id_pembeli
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update status pesanan
app.put('/api/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = $2 WHERE order_id = $3 RETURNING *',
      [status, new Date(), orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    res.json({ success: true, message: 'Status pesanan berhasil diperbarui' });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT batalkan pesanan
app.put('/api/orders/:orderId/cancel', async (req, res) => {
  const { orderId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cek status pesanan saat ini
    const orderResult = await client.query(
      'SELECT status, id_pembeli FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    const currentStatus = orderResult.rows[0].status;
    const id_pembeli = orderResult.rows[0].id_pembeli;

    // Hanya boleh membatalkan pesanan dengan status tertentu
    if (!['pending', 'success', 'shipping'].includes(currentStatus)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Pesanan tidak dapat dibatalkan karena status sudah ' + currentStatus 
      });
    }

    // Update status pesanan menjadi cancelled
    await client.query(
      'UPDATE orders SET status = $1, updated_at = $2 WHERE order_id = $3',
      ['cancelled', new Date(), orderId]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Pesanan berhasil dibatalkan' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error canceling order:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// ===== END ENDPOINT CRUD PESANAN =====

// Endpoint untuk MENGAMBIL cart dari database
app.get('/api/cart', authenticateToken, async (req, res) => {
  const username = req.user.username;

  try {
    // Ambil id_pembeli berdasarkan username
    const pembeliResult = await pool.query('SELECT id_pembeli FROM pembeli WHERE username = $1', [username]);
    if (pembeliResult.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    const id_pembeli = pembeliResult.rows[0].id_pembeli;

    // Ambil data keranjang dari database
    const cartResult = await pool.query(
      `SELECT b.id_barang, b.nama_barang, b.harga, k.jumlah, b.gambar_barang as gambar
       FROM keranjang k
       JOIN barang b ON k.id_barang = b.id_barang
       WHERE k.id_pembeli = $1`,
      [id_pembeli]
    );

    // Format data agar sesuai dengan yang diharapkan frontend
    const cart = cartResult.rows.map(item => ({
      id_barang: item.id_barang,
      name: item.nama_barang,
      price: item.harga, // FIX: Menggunakan item.harga
      quantity: item.jumlah, // FIX: Menggunakan item.jumlah
      image: item.gambar
    }));

    res.json(cart);
  } catch (err) {
    console.error('Error saat mengambil keranjang:', err.message);
    res.status(500).json({ error: 'Gagal mengambil keranjang dari database' });
  }
});

// Endpoint untuk mengambil data pembeli_info berdasarkan username
app.get('/api/pembeli-info', async (req, res) => {
  const { username } = req.query;
  try {
    const pembeli = await pool.query('SELECT id_pembeli FROM pembeli WHERE username = $1', [username]);
    if (pembeli.rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
    const id_pembeli = pembeli.rows[0].id_pembeli;
    const info = await pool.query('SELECT * FROM pembeli_info WHERE id_pembeli = $1', [id_pembeli]);
    if (info.rows.length === 0) return res.status(404).json({ error: 'Data info tidak ditemukan' });
    res.json(info.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk menyimpan cart ke database (dilindungi oleh JWT)
app.post('/api/cart', authenticateToken, async (req, res) => {
  const { cart } = req.body;
  const username = req.user.username;

  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Format data cart tidak valid' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ambil id_pembeli berdasarkan username dari token
    const pembeliResult = await client.query('SELECT id_pembeli FROM pembeli WHERE username = $1', [username]);
    if (pembeliResult.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    const id_pembeli = pembeliResult.rows[0].id_pembeli;

    // Hapus keranjang lama untuk user ini
    await client.query('DELETE FROM keranjang WHERE id_pembeli = $1', [id_pembeli]);

    // Simpan keranjang baru
    if (cart.length > 0) {
        const insertPromises = cart.map(item => {
            return client.query(
                'INSERT INTO keranjang (id_pembeli, id_barang, jumlah) VALUES ($1, $2, $3)', // FIX: Menggunakan kolom "jumlah"
                [id_pembeli, item.id_barang, item.quantity]
            );
        });
        await Promise.all(insertPromises);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Keranjang berhasil disimpan' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saat menyimpan keranjang:', err.message);
    res.status(500).json({ error: 'Gagal menyimpan keranjang ke database' });
  } finally {
    client.release();
  }
});

// Endpoint untuk membuat transaksi pembayaran
app.post('/api/payment/create', authenticateToken, async (req, res) => {
  const { items, customerDetails, totalAmount } = req.body;
  const username = req.user.username;

  try {
    // Generate order ID unik
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Parameter transaksi untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: customerDetails.nama_pembeli || username,
        email: customerDetails.email || `${username}@example.com`,
        phone: customerDetails.no_hp || '08123456789'
      },
      item_details: items.map(item => ({
        id: item.id_barang.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.name
      })),
      enabled_payments: ['gopay', 'qris', 'shopeepay', 'other_qris'],
      gopay: {
        enable_callback: true,
        callback_url: 'https://example.com/payment/callback'
      }
    };

    // Buat transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);
    
    // Simpan transaksi ke database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Ambil id_pembeli
      const pembeliResult = await client.query('SELECT id_pembeli FROM pembeli WHERE username = $1', [username]);
      const id_pembeli = pembeliResult.rows[0].id_pembeli;
      
      // Simpan order ke database (Anda perlu membuat tabel orders)
      await client.query(
        'INSERT INTO orders (order_id, id_pembeli, total_amount, status, created_at) VALUES ($1, $2, $3, $4, $5)',
        [orderId, id_pembeli, totalAmount, 'pending', new Date()]
      );
      
      // Simpan detail items (Anda perlu membuat tabel order_items)
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, id_barang, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.id_barang, item.quantity, item.price]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId
      });
      
    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Gagal membuat transaksi pembayaran',
      details: error.message 
    });
  }
});

// Endpoint untuk notifikasi dari Midtrans
app.post('/api/payment/notification', async (req, res) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

    // Update status di database
    const client = await pool.connect();
    try {
      let orderStatus = 'pending';
      
      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          orderStatus = 'challenge';
        } else if (fraudStatus == 'accept') {
          orderStatus = 'success';
        }
      } else if (transactionStatus == 'settlement') {
        orderStatus = 'success';
      } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        orderStatus = 'failed';
      } else if (transactionStatus == 'pending') {
        orderStatus = 'pending';
      }

      await client.query(
        'UPDATE orders SET status = $1, updated_at = $2 WHERE order_id = $3',
        [orderStatus, new Date(), orderId]
      );
      
      // Jika pembayaran berhasil, kosongkan keranjang
      if (orderStatus === 'success') {
        const orderResult = await client.query('SELECT id_pembeli FROM orders WHERE order_id = $1', [orderId]);
        if (orderResult.rows.length > 0) {
          const id_pembeli = orderResult.rows[0].id_pembeli;
          await client.query('DELETE FROM keranjang WHERE id_pembeli = $1', [id_pembeli]);
        }
      }
      
    } finally {
      client.release();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk mengecek status pembayaran
app.get('/api/payment/status/:orderId', authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order tidak ditemukan' });
    }
    
    const order = result.rows[0];
    res.json({
      success: true,
      order_id: order.order_id,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk mengambil pesanan user
app.get('/api/user-orders', authenticateToken, async (req, res) => {
  const username = req.user.username;
  
  try {
    // First, get the user ID from username
    const userResult = await pool.query('SELECT id_pembeli FROM pembeli WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const userId = userResult.rows[0].id_pembeli;
    
    // Ambil semua pesanan user dengan item yang dibeli
    const ordersResult = await pool.query(`
      SELECT 
        o.order_id, 
        o.total_amount, 
        o.status, 
        o.created_at, 
        o.updated_at,
        CASE 
          WHEN COUNT(oi.id) = 0 THEN '[]'::json
          ELSE json_agg(
            json_build_object(
              'nama_barang', b.nama_barang,
              'quantity', oi.quantity,
              'price', oi.price
            )
          )
        END as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN barang b ON oi.id_barang = b.id_barang
      WHERE o.id_pembeli = $1
      GROUP BY o.order_id, o.total_amount, o.status, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      orders: ordersResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk update profile pembeli
app.put('/api/update-profile', authenticateToken, async (req, res) => {
  const { username, nama_pembeli, email, no_hp, negara_pembeli, provinsi_pembeli, kota_pembeli, alamat1_pembeli, kode_pos } = req.body;
  
  try {
    // Ambil id_pembeli berdasarkan username
    const userResult = await pool.query('SELECT id_pembeli FROM pembeli WHERE username = $1', [username]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
    }
    
    const id_pembeli = userResult.rows[0].id_pembeli;
    
    // Update tabel pembeli_info
    const result = await pool.query(`
      UPDATE pembeli_info SET 
        nama_pembeli = $1, 
        email_pembeli = $2, 
        notelp_pembeli = $3, 
        negara_pembeli = $4, 
        provinsi_pembeli = $5, 
        kota_pembeli = $6, 
        alamat1_pembeli = $7, 
        kode_pos = $8
      WHERE id_pembeli = $9
      RETURNING *
    `, [nama_pembeli, email, no_hp, negara_pembeli, provinsi_pembeli, kota_pembeli, alamat1_pembeli, kode_pos, id_pembeli]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Data pembeli tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Profile berhasil diperbarui',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve React App in Production
if (process.env.NODE_ENV === 'production') {
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
