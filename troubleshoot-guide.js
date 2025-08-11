// Panduan lengkap troubleshooting Supabase connection

console.log('🔧 SUPABASE CONNECTION TROUBLESHOOTING GUIDE');
console.log('============================================\n');

console.log('❌ Error yang terjadi: "SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing"');
console.log('💡 Error ini biasanya disebabkan oleh:\n');

console.log('1. 🔑 PASSWORD SALAH');
console.log('   • Password yang Anda berikan mungkin tidak sesuai');
console.log('   • Karakter khusus dalam password ([, !, ]) mungkin menyebabkan masalah');
console.log('   • Solusi: Reset password di Supabase Dashboard\n');

console.log('2. 🏢 DATABASE PAUSED');
console.log('   • Supabase otomatis pause database yang tidak aktif');
console.log('   • Solusi: Buka Supabase Dashboard dan resume database\n');

console.log('3. 🌐 NETWORK/IP RESTRICTIONS');
console.log('   • Ada pembatasan IP di Supabase');
console.log('   • Solusi: Cek Settings > Database > Network restrictions\n');

console.log('4. 🔧 SSL CONFIGURATION');
console.log('   • Supabase memerlukan SSL connection');
console.log('   • Pastikan menggunakan ssl: { rejectUnauthorized: false }\n');

console.log('📋 LANGKAH YANG HARUS DILAKUKAN:');
console.log('================================\n');

console.log('LANGKAH 1: Cek Status Database');
console.log('• Buka https://supabase.com/dashboard');
console.log('• Pilih project Anda');
console.log('• Lihat di sidebar kiri, apakah ada indikator "PAUSED"');
console.log('• Jika paused, klik tombol "Resume" atau "Unpause"\n');

console.log('LANGKAH 2: Verifikasi Connection Info');
console.log('• Di dashboard, pergi ke Settings > Database');
console.log('• Bagian "Connection info", pastikan:');
console.log('  - Host: aws-0-ap-southeast-1.pooler.supabase.com');
console.log('  - Database name: postgres');
console.log('  - Port: 6543');
console.log('  - User: postgres.vzgsuobhmepbrpgikwkz\n');

console.log('LANGKAH 3: Reset Password (REKOMENDASI)');
console.log('• Di Settings > Database');
console.log('• Scroll ke bagian "Database password"');
console.log('• Klik "Generate new password"');
console.log('• PENTING: Copy password baru dan simpan dengan aman');
console.log('• Password baru sebaiknya tidak mengandung karakter [ ] ! untuk menghindari masalah encoding\n');

console.log('LANGKAH 4: Update Environment Variables');
console.log('• Setelah dapat password baru, update file .env:');
console.log('  DATABASE_URL=postgresql://postgres.vzgsuobhmepbrpgikwkz:PASSWORD_BARU@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres\n');

console.log('LANGKAH 5: Test Connection Ulang');
console.log('• Jalankan: node test-debug.js');
console.log('• Jika masih gagal, coba langkah 6\n');

console.log('LANGKAH 6: Cek Network Restrictions');
console.log('• Di Settings > Database');
console.log('• Scroll ke "Network restrictions"');
console.log('• Pastikan "Allow all IP addresses" dicentang');
console.log('• Atau tambahkan IP Anda ke whitelist\n');

console.log('🎯 PRIORITAS LANGKAH:');
console.log('1. Cek apakah database di-pause (paling sering)');
console.log('2. Reset password dengan karakter yang lebih simple');
console.log('3. Cek network restrictions\n');

console.log('💬 Setelah melakukan langkah-langkah di atas, beritahu saya:');
console.log('• Apakah database sudah di-unpause?');
console.log('• Apakah sudah mendapat password baru?');
console.log('• Dan kita akan test ulang dengan konfigurasi yang benar.\n');

console.log('🔄 Untuk test ulang setelah update password, edit test-debug.js');
console.log('   dan ganti password dengan yang baru, lalu jalankan kembali.\n');

const { Pool } = require('pg');

// Quick test function untuk setelah password di-reset
async function quickTest(newPassword) {
  if (!newPassword) {
    console.log('⚠️  Untuk test dengan password baru, jalankan:');
    console.log('   quickTest("password_baru_anda")');
    return;
  }
  
  console.log('🧪 Testing dengan password baru...');
  
  const pool = new Pool({
    user: 'postgres.vzgsuobhmepbrpgikwkz',
    password: newPassword,
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('✅ SUCCESS! Password baru berhasil!');
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Masih gagal:', error.message);
    return false;
  }
}

// Export untuk digunakan nanti
global.quickTest = quickTest;
