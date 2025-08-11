# 🚀 PANDUAN DEPLOY VERCEL - ZEA PET SHOP
# =======================================

## ✅ STATUS SAAT INI
- Database Supabase: SIAP ✅
- Connection Test: BERHASIL ✅  
- Environment Variables: SIAP ✅
- Build Configuration: SIAP ✅

## 🔧 LANGKAH DEPLOYMENT MANUAL (RECOMMENDED)

### OPSI 1: Deploy via Vercel Dashboard (MUDAH)

1. **Buka https://vercel.com**
   - Sign up / Login dengan GitHub account
   
2. **Create New Project**
   - Klik "Add New..." > "Project"
   - Pilih "Import Git Repository"
   
3. **Connect GitHub Repository**
   - Jika belum ada, upload project ke GitHub dulu:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/USERNAME/zea-pet-shop.git
     git push -u origin main
     ```
   
4. **Configure Project**
   - Framework Preset: "Other"
   - Root Directory: "/"
   - Build Command: "npm run build"
   - Output Directory: "build"
   - Install Command: "npm install"

5. **Environment Variables (PENTING!)**
   Tambahkan di Vercel Dashboard > Settings > Environment Variables:
   ```
   DATABASE_URL = postgresql://postgres.vzgsuobhmepbrpgikwkz:5nop31244S!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   JWT_SECRET = ZeaPetShop2025_SecureKey_ProductionMode_VerySecureKeyForOnlineDeployment
   NODE_ENV = production
   ```

6. **Deploy**
   - Klik "Deploy"
   - Tunggu hingga selesai

### OPSI 2: Manual Upload (TANPA GIT)

1. **Build Project Locally**
   ```bash
   npm run build
   ```

2. **Compress Build Folder**
   - Zip seluruh project folder
   
3. **Deploy Manual di Vercel**
   - Drag & drop ZIP file ke vercel.com
   - Set environment variables seperti di atas

### OPSI 3: Vercel CLI (SETELAH LOGIN BERHASIL)

1. **Login Ulang**
   ```bash
   vercel login
   ```
   - Pilih email/GitHub
   - Ikuti instruksi di browser

2. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 ENVIRONMENT VARIABLES YANG DIBUTUHKAN

Pastikan set di Vercel Dashboard:

```env
DATABASE_URL=postgresql://postgres.vzgsuobhmepbrpgikwkz:5nop31244S!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=ZeaPetShop2025_SecureKey_ProductionMode_VerySecureKeyForOnlineDeployment
NODE_ENV=production
```

## 🧪 TESTING SETELAH DEPLOY

Setelah deploy berhasil, test:
1. Homepage: https://your-app.vercel.app
2. API Health: https://your-app.vercel.app/api
3. Admin Login: https://your-app.vercel.app/admin

## 🔧 TROUBLESHOOTING

Jika ada error setelah deploy:
1. Check Vercel Function Logs
2. Pastikan Environment Variables ter-set
3. Test API endpoint: /api/test-db

## 📝 NEXT STEPS

1. **Deploy dulu menggunakan OPSI 1** (paling mudah)
2. Set environment variables dengan benar
3. Test website setelah deploy
4. Jika ada masalah, kita debug bersama

---

🎯 **REKOMENDASI**: Gunakan OPSI 1 (Vercel Dashboard) karena paling mudah dan reliable.

Apakah Anda sudah memiliki GitHub account? Jika ya, mari kita upload project ke GitHub dulu, lalu deploy via Vercel Dashboard.
