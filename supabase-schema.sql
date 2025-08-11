-- Pet Shop Zea Database Schema untuk Supabase
-- Copy dan paste script ini ke Supabase SQL Editor

-- 1. Tabel Kategori
CREATE TABLE IF NOT EXISTS kategori (
  id_kategori SERIAL PRIMARY KEY,
  nama_kategori VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Barang (Products)
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

-- 3. Tabel Pembeli (Users)
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

-- 6. Insert Data Kategori Default
INSERT INTO kategori (nama_kategori) VALUES 
('Makanan Kucing'),
('Makanan Anjing'),
('Aksesori'),
('Mainan'),
('Perawatan'),
('Kandang')
ON CONFLICT DO NOTHING;

-- 7. Insert Admin User (password: admin123)
-- Password hash untuk 'admin123' menggunakan bcrypt
INSERT INTO pembeli (
  username, 
  password, 
  nama_pembeli, 
  negara_pembeli, 
  provinsi_pembeli, 
  kota_pembeli, 
  alamat1_pembeli
) VALUES (
  'admin',
  '$2b$10$8K1p/a0dRT2XnXqjyh6SFuXCw8t8EjzTQHiI2uJ7wAK0rEVz8VNTS',
  'Administrator',
  'Indonesia',
  'DKI Jakarta',
  'Jakarta Pusat',
  'Jl. Admin No. 1'
) ON CONFLICT (username) DO NOTHING;

-- 8. Create indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(id_kategori);
CREATE INDEX IF NOT EXISTS idx_orders_pembeli ON orders(id_pembeli);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_barang ON order_items(id_barang);

-- 9. Enable Row Level Security (RLS) - Opsional untuk keamanan
ALTER TABLE pembeli ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Selesai! Database siap digunakan.
