# 🚨 DEPLOYMENT TROUBLESHOOTING GUIDE

## ✅ STATUS SAAT INI:
- ✅ API berhasil di-deploy ke Vercel
- ✅ Database connection berhasil
- ✅ Database tables sudah ter-setup
- ❌ Login gagal 401 - Environment variables belum ter-set

## 🔧 LANGKAH PENYELESAIAN:

### 1. Set Environment Variables di Vercel
Buka: https://vercel.com/dashboard → zea-pet-shop → Settings → Environment Variables

Tambahkan variables berikut (ambil nilai dari LOCAL_CREDENTIALS.txt):
- `DATABASE_URL`
- `JWT_SECRET` 
- `NODE_ENV` = `production`
- `CORS_ORIGIN` = `https://zea-pet-shop.vercel.app`
- `MIDTRANS_IS_PRODUCTION` = `false`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY`

### 2. Redeploy
Vercel akan auto-redeploy setelah environment variables di-set.

### 3. Test Login
Credentials untuk testing:
- Username: `admin`
- Password: `admin123`

## 📍 TEST ENDPOINTS:
- https://zea-pet-shop.vercel.app/api/test
- https://zea-pet-shop.vercel.app/api/test-db
- https://zea-pet-shop.vercel.app/api/test-midtrans

## 🎯 NEXT STEPS:
1. Set environment variables di Vercel dashboard
2. Wait for auto-redeploy (2-3 menit)
3. Test login di website
4. Database sudah siap, langsung bisa digunakan
