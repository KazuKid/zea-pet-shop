# 🚀 Checklist Deploy Pet Shop Zea ke Vercel

## ✅ Yang Sudah Selesai:
- [x] Database Supabase sudah setup
- [x] API serverless function siap
- [x] Build configuration ready

## 📋 Langkah Selanjutnya:

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login ke Vercel**
```bash
vercel login
# Follow login instructions
```

### **Step 3: Deploy Project**
```bash
# Di folder project root (d:\TA\zea-pet-shop)
vercel

# Jawab pertanyaan:
# ? Set up and deploy "d:\TA\zea-pet-shop"? [Y/n] Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? zea-pet-shop
# ? In which directory is your code located? ./
```

### **Step 4: Set Environment Variables**

Setelah deploy pertama, masuk ke Vercel Dashboard:

1. **Buka** https://vercel.com/dashboard
2. **Pilih project** "zea-pet-shop" 
3. **Settings** → **Environment Variables**
4. **Tambahkan variables berikut:**

```bash
DATABASE_URL = postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
JWT_SECRET = ZeaPetShop2025_SecureKey_VercelProduction_VerySecureKey
NODE_ENV = production
REACT_APP_VERCEL = true
```

**Optional (jika sudah setup Midtrans):**
```bash
MIDTRANS_SERVER_KEY = your_production_server_key
MIDTRANS_CLIENT_KEY = your_production_client_key  
MIDTRANS_IS_PRODUCTION = true
```

### **Step 5: Redeploy dengan Environment Variables**
```bash
vercel --prod
```

### **Step 6: Setup Database Tables**

Setelah deploy berhasil:

**Option A: Via API Endpoint**
1. Buka: `https://your-app-name.vercel.app/api/setup-database`
2. Jika berhasil, akan muncul pesan "Database setup completed successfully!"

**Option B: Via Supabase SQL Editor**
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file `supabase-schema.sql`
3. Run query

### **Step 7: Test Website**

1. **Test Homepage**: https://your-app-name.vercel.app
2. **Test API**: https://your-app-name.vercel.app/api/test
3. **Test Login**: 
   - Username: `admin`
   - Password: `admin123`

### **Step 8: Add Sample Products (Optional)**

Login sebagai admin, lalu tambahkan beberapa produk sample untuk testing.

---

## 🎯 URLs Penting:

- **Website**: https://your-app-name.vercel.app
- **API Test**: https://your-app-name.vercel.app/api/test
- **Setup Database**: https://your-app-name.vercel.app/api/setup-database
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🆘 Jika Ada Error:

### Database Connection Error:
```bash
# Check Supabase connection string
# Make sure password is correct
# Verify environment variables in Vercel
```

### Build Error:
```bash
# Check build logs in Vercel dashboard
# Verify all dependencies in package.json
```

### API Not Working:
```bash
# Check function logs in Vercel dashboard
# Verify api/index.js exports app correctly
```

---

## 🎉 Setelah Deploy Berhasil:

1. **Test all features**
2. **Add sample products**  
3. **Test user registration**
4. **Configure custom domain** (optional)
5. **Setup monitoring**

**Ready to deploy! 🚀**
