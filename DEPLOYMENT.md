# 🚀 Deployment Guide - Pet Shop Zea

## 📋 Persiapan Sebelum Deploy

### 1. **Build Production**
```bash
npm run build
```

### 2. **Test Production Locally**
```bash
npm run start:prod
```

### 3. **Environment Variables Setup**
Siapkan environment variables untuk production:

- `NODE_ENV=production`
- `PORT=5000` (atau sesuai platform)
- `DB_HOST=your-production-database-host`
- `DB_USER=your-production-database-user`
- `DB_PASSWORD=your-production-database-password`
- `DB_NAME=PetShopZea`
- `JWT_SECRET=your-super-secret-key`
- `MIDTRANS_SERVER_KEY=your-production-midtrans-key`
- `MIDTRANS_CLIENT_KEY=your-production-midtrans-client-key`
- `MIDTRANS_IS_PRODUCTION=true`

---

## 🌐 Platform Deployment Options

### **Option 1: Heroku (Recommended - Free Tier Available)**

#### Step 1: Install Heroku CLI
```bash
# Download dari https://devcenter.heroku.com/articles/heroku-cli
```

#### Step 2: Login ke Heroku
```bash
heroku login
```

#### Step 3: Create Heroku App
```bash
heroku create zea-pet-shop
```

#### Step 4: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-key
heroku config:set DB_HOST=your-production-db-host
heroku config:set DB_USER=your-production-db-user
heroku config:set DB_PASSWORD=your-production-db-password
heroku config:set MIDTRANS_SERVER_KEY=your-production-key
heroku config:set MIDTRANS_IS_PRODUCTION=true
```

#### Step 5: Setup Database (PostgreSQL)
```bash
heroku addons:create heroku-postgresql:mini
```

#### Step 6: Deploy
```bash
git add .
git commit -m "Ready for deployment"
git push heroku main
```

#### Step 7: Run Database Migration
```bash
heroku run node create-tables.js
```

---

### **Option 2: Vercel (Frontend) + Railway (Backend)**

#### Frontend di Vercel:
1. Push code ke GitHub
2. Connect GitHub repo ke Vercel
3. Set build command: `npm run build`
4. Deploy automatically

#### Backend di Railway:
1. Connect GitHub repo ke Railway
2. Set environment variables
3. Deploy automatically

---

### **Option 3: DigitalOcean App Platform**

#### Step 1: Create Account
- Sign up di DigitalOcean
- Create new App

#### Step 2: Connect Repository
- Connect GitHub repository
- Select branch (main)

#### Step 3: Configure App
```yaml
name: zea-pet-shop
services:
- name: web
  source_dir: /
  github:
    repo: your-username/zea-pet-shop
    branch: main
  run_command: npm run start:prod
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-secret-key
```

---

### **Option 4: VPS Manual Deployment**

#### Step 1: Setup VPS (Ubuntu 20.04+)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### Step 2: Setup Database
```bash
sudo -u postgres createdb PetShopZea
sudo -u postgres psql
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE PetShopZea TO your_user;
\q
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/zea-pet-shop.git
cd zea-pet-shop

# Install dependencies
npm install

# Build application
npm run build

# Create production environment file
cp .env.production .env

# Start with PM2
pm2 start server.js --name "zea-pet-shop"
pm2 startup
pm2 save
```

#### Step 4: Setup Nginx (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security Checklist

- [ ] Update semua environment variables dengan nilai production
- [ ] Ganti JWT secret key dengan key yang kuat
- [ ] Setup SSL certificate (HTTPS)
- [ ] Update CORS origin ke domain production
- [ ] Setup database backup
- [ ] Enable rate limiting
- [ ] Update Midtrans ke production mode
- [ ] Test payment flow dengan Midtrans production

---

## 📊 Monitoring & Maintenance

### Health Check Endpoint
Tambahkan endpoint untuk monitoring:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

### Database Backup
Setup automatic database backup sesuai platform yang dipilih.

---

## 🆘 Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check environment variables
2. **Build Fails**: Check Node.js version compatibility
3. **Images Not Loading**: Verify file upload path and permissions
4. **Payment Not Working**: Verify Midtrans production keys

### Logs:
```bash
# Heroku
heroku logs --tail

# PM2 
pm2 logs zea-pet-shop

# Docker
docker logs container_name
```

---

## 💡 Rekomendasi Platform

**Untuk Pemula**: Heroku (mudah setup, ada free tier)
**Untuk Performance**: DigitalOcean App Platform
**Untuk Budget**: VPS Manual Setup
**Untuk Scaling**: AWS/Google Cloud

Pilih sesuai kebutuhan dan budget Anda!
