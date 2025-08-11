# INSTRUKSI KONFIGURASI MIDTRANS

## 1. Login ke Dashboard Midtrans
- Buka: https://dashboard.midtrans.com
- Login dengan akun Anda

## 2. Copy Server Key dan Client Key
- Pergi ke Settings > Access Keys
- Copy "Server Key Sandbox" dan "Client Key Sandbox"
- Paste ke file .env di folder project

## 3. Set Notification URL
- Pergi ke Settings > Configuration
- Set "Payment Notification URL" ke: http://localhost:5000/api/payment/notification
- Set "Finish Redirect URL" ke: http://localhost:3000/payment/callback
- Set "Error Redirect URL" ke: http://localhost:3000/payment/callback
- Set "Unfinish Redirect URL" ke: http://localhost:3000/payment/callback

## 4. Enable Payment Methods
- Pergi ke Settings > Configuration
- Enable:
  - GoPay
  - QRIS
  - ShopeePay
  - Other e-wallets (opsional)

## 5. Update file .env dengan key asli
- Buka file .env
- Ganti YOUR_ACTUAL_SERVER_KEY_HERE dengan Server Key Anda
- Ganti YOUR_ACTUAL_CLIENT_KEY_HERE dengan Client Key Anda

## Contoh .env:
MIDTRANS_SERVER_KEY=SB-Mid-server-abc123def456ghi789
MIDTRANS_CLIENT_KEY=SB-Mid-client-xyz789uvw123rst456
