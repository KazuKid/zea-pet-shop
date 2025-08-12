# 🔧 PRODUCTION TEST SCRIPTS

## Script untuk Testing Production:

### 1. Test Direct Login
```bash
node test-direct-login.js
```
Menguji login langsung ke production URL.

### 2. Test Database Connection
```bash
node test-db-admin.js
```
Menguji database connection dan user admin.

### 3. Setup Database
```bash
node setup-production-correct.js
```
Setup database tables di production (jika diperlukan).

## 📊 Expected Results:
- API harus respond dengan status 200
- Database connection harus berhasil
- Login harus berhasil setelah environment variables ter-set

## 🚨 Common Issues:
- 401 Unauthorized = Environment variables belum ter-set di Vercel
- 500 Internal Error = Database connection issue
- Network Error = API endpoint tidak accessible

## 🎯 Next Actions:
1. Set environment variables di Vercel Dashboard
2. Run test scripts untuk verification
3. Monitor production logs di Vercel dashboard
