-- Script untuk menambahkan kolom email_pembeli dan notelp_pembeli ke tabel pembeli
-- Tanggal: 17 Juli 2025

-- Tambahkan kolom email_pembeli
ALTER TABLE pembeli ADD COLUMN IF NOT EXISTS email_pembeli VARCHAR(255);

-- Tambahkan kolom notelp_pembeli
ALTER TABLE pembeli ADD COLUMN IF NOT EXISTS notelp_pembeli VARCHAR(20);

-- Tambahkan index untuk email_pembeli untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS idx_pembeli_email ON pembeli(email_pembeli);

-- Tambahkan index untuk notelp_pembeli untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS idx_pembeli_notelp ON pembeli(notelp_pembeli);

-- Menampilkan struktur tabel setelah penambahan kolom
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pembeli'
ORDER BY ordinal_position;
