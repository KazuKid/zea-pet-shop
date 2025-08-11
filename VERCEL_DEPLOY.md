# 🚀 Deploy Pet Shop Zea ke Vercel

## 📋 Persiapan

### 1. **Setup Database PostgreSQL**
Anda perlu database PostgreSQL di cloud. Pilihan recommended:
- **Supabase** (Free tier tersedia): https://supabase.com
- **Neon** (Free tier tersedia): https://neon.tech  
- **Railway** (Paid): https://railway.app
- **ElephantSQL** (Free tier): https://www.elephantsql.com

### 2. **Setup Midtrans Production**
- Daftar akun production di https://midtrans.com
- Dapatkan Server Key dan Client Key production
- Aktifkan metode pembayaran yang diinginkan

---

## 🌐 Deploy ke Vercel

### **Step 1: Persiapan Repository**
```bash
# Push kode ke GitHub (jika belum)
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### **Step 2: Deploy ke Vercel**

#### **Option A: Via Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Ikuti instruksi:
# 1. Link to existing project? No
# 2. Project name: zea-pet-shop
# 3. Directory: ./
# 4. Override settings? No
```

#### **Option B: Via Vercel Dashboard**
1. Kunjungi https://vercel.com
2. Login dengan GitHub
3. Click "New Project"
4. Import repository "zea-pet-shop"
5. Configure project settings:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### **Step 3: Set Environment Variables**

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

```bash
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# JWT
JWT_SECRET=ZeaPetShop2025_SecureKey_VercelProduction_VerySecureKey

# Midtrans  
MIDTRANS_SERVER_KEY=your_production_server_key
MIDTRANS_CLIENT_KEY=your_production_client_key
MIDTRANS_IS_PRODUCTION=true

# App Config
NODE_ENV=production
REACT_APP_VERCEL=true
```

### **Step 4: Setup Database Tables**

Setelah deploy berhasil, Anda perlu membuat tabel di database production:

#### **Option A: Manual via Database Console**
```sql
-- Copy dan paste isi dari create-tables.js ke database console
-- Atau jalankan query SQL secara manual
```

#### **Option B: Via API Endpoint**  
Buat endpoint khusus untuk setup database (hanya untuk sekali pakai):

```javascript
// Tambahkan di api/index.js (hapus setelah digunakan)
app.get('/api/setup-database', async (req, res) => {
  try {
    // Copy query dari create-tables.js
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kategori (
        id_kategori SERIAL PRIMARY KEY,
        nama_kategori VARCHAR(255) NOT NULL
      )
    `);
    // ... dst untuk semua tabel
    res.json({ success: true, message: 'Database setup complete' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **Step 5: Test Deployment**

1. **Test API**: 
   - Kunjungi `https://your-app.vercel.app/api/test`
   - Harus return JSON response

2. **Test Login/Register**:
   - Coba register user baru
   - Test login functionality

3. **Test Product Listing**:
   - Pastikan produk bisa ditampilkan
   - Test kategori filtering

4. **Test Payment** (jika sudah setup Midtrans):
   - Coba proses checkout
   - Verify payment flow

---

## 🔧 Troubleshooting

### **Database Connection Issues**
```bash
# Error: "Connection terminated unexpectedly"
# Solution: Pastikan DATABASE_URL benar dan include SSL

# Format DATABASE_URL:
postgresql://username:password@hostname:port/database?ssl=true
```

### **API Routes Not Working**
```bash
# Error: 404 on /api/* routes
# Check vercel.json configuration
# Ensure api/index.js exists and exports app correctly
```

### **Build Errors**
```bash
# Error: "Module not found"
# Check all imports in React components
# Ensure all dependencies are in package.json

# Clear cache and rebuild:
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Environment Variables Not Working**
```bash
# Check Vercel Dashboard → Settings → Environment Variables
# Ensure all variables are set for Production environment
# Redeploy after adding variables
```

### **File Upload Issues**
```bash
# Vercel serverless functions have limitations
# For file uploads, consider using:
# - Cloudinary for images
# - AWS S3 with signed URLs
# - Vercel Blob storage
```

---

## 📈 Monitoring & Performance

### **Check Logs**
```bash
# Via Vercel CLI
vercel logs

# Via Dashboard
# Go to Functions tab → View function logs
```

### **Performance Optimization**
```javascript
// Enable gzip compression
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  if (req.url.includes('/api/')) {
    res.set('Cache-Control', 'no-cache');
  } else {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

---

## 🔒 Security Best Practices

### **Environment Variables**
- Jangan commit file `.env` ke Git
- Gunakan strong JWT secret (min 64 karakter)
- Set CORS origin ke domain spesifik

### **Database Security**
```javascript
// Use connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### **API Security**
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

## 🎯 Production Checklist

- [ ] Database created and connected
- [ ] Environment variables set
- [ ] API endpoints working
- [ ] Authentication functional
- [ ] File uploads working (or alternative implemented)
- [ ] Payment integration tested
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring setup
- [ ] Performance optimization applied

---

## 💡 Tips & Tricks

### **Custom Domain**
```bash
# Add custom domain in Vercel Dashboard
# Update DNS records as instructed
# HTTPS certificate automatically generated
```

### **Automatic Deployments**
```bash
# Every git push to main branch triggers deployment
# Preview deployments for other branches
# Rollback to previous versions easily
```

### **Team Collaboration**
```bash
# Invite team members in Vercel Dashboard
# Set up different environments (staging, production)
# Use preview deployments for testing
```

**Vercel deployment ready! 🚀🎉**
