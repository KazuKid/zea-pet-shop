# 🚀 ZEA PET SHOP - DEPLOYMENT GUIDE

## 🎯 **Live Application**
- **Website:** https://zea-pet-shop.vercel.app
- **Admin Panel:** Use admin credentials to access management features
- **API Documentation:** Available at `/api/test` endpoint

## ⚡ **Quick Setup for New Deployments**

### 1. **Environment Variables Setup**
In your Vercel Dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Supabase or other PostgreSQL provider |
| `JWT_SECRET` | 64-character secret key | Generate with crypto.randomBytes(64) |
| `NODE_ENV` | `production` | Environment mode |
| `CORS_ORIGIN` | `https://your-domain.vercel.app` | Your Vercel domain |
| `MIDTRANS_IS_PRODUCTION` | `false` | Set to true for live payments |
| `MIDTRANS_SERVER_KEY` | Your Midtrans server key | From Midtrans dashboard |
| `MIDTRANS_CLIENT_KEY` | Your Midtrans client key | From Midtrans dashboard |

### 2. **Generate JWT Secret**
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. **Deploy to Vercel**
```bash
# Option 1: Auto-deploy from GitHub (recommended)
git push origin main

# Option 2: Manual deployment
vercel --prod
```

### 4. **Database Initialization**
After deployment, visit your domain `/api/setup-database` once to:
- Create all necessary tables
- Insert default categories
- Create default admin user
- Set up indexes for performance

### 5. **Test Deployment**
Run the test script to verify everything works:
```bash
node test-vercel-api.js
```

Or manually test these endpoints:
- 🔍 **Health Check:** `/api/test`
- 🔍 **Database:** `/api/test-db`  
- 🔍 **Payment Gateway:** `/api/test-midtrans`

## 🔐 **Default Login Credentials**
After database setup, use these credentials:

**Admin Access:**
- Username: `admin`
- Password: `admin123`

**Test User:**
- Username: `user1`
- Password: `user123`

## 🛠️ **Troubleshooting**

### Common Issues:

**❌ Database Connection Failed**
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check if Supabase instance is active and accessible
- Ensure database allows connections from Vercel IPs

**❌ JWT Token Issues**
- Verify `JWT_SECRET` is set and matches between environments
- Clear browser localStorage: `localStorage.clear()`
- Generate a new strong JWT secret

**❌ CORS Errors**
- Set `CORS_ORIGIN` to your exact Vercel domain
- Ensure no trailing slash in domain URL
- Check if domain is correctly configured in Vercel

**❌ Payment Gateway Issues**
- Verify both Midtrans keys are set correctly
- Check Midtrans dashboard for key validity
- Ensure `MIDTRANS_IS_PRODUCTION` matches your environment

### Debug Steps:
1. Check Vercel Function Logs in dashboard
2. Run test script: `node test-vercel-api.js`
3. Verify all environment variables are set
4. Test database connection separately

## 📊 **Performance & Monitoring**
- Function timeout set to 30 seconds
- Database connections are pooled
- Environment variables cached
- Error logging enabled

## 🔄 **Updates & Maintenance**
- Push to main branch for auto-deployment
- Monitor Vercel dashboard for deployment status
- Check database connection periodically
- Update Midtrans keys when needed

## 📚 **Additional Resources**
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Midtrans Docs:** https://docs.midtrans.com

---
**🎉 Your Zea Pet Shop is ready for production!**

Test the live application and enjoy your complete e-commerce solution.
