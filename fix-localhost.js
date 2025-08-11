// Script untuk mengganti semua localhost:5000 dengan API_URL yang benar

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/AdminPage.js',
  'src/components/CartPage.js', 
  'src/components/RegisterPage.js',
  'src/components/HomePage.js',
  'src/components/AccountPage.js',
  'src/components/PaymentPage.js',
  'src/components/PaymentCallbackPage.js',
  'src/utils/auth.js',
  'src/components/ConnectionTest.js'
];

const basePath = process.cwd();

filesToFix.forEach(filePath => {
  const fullPath = path.join(basePath, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if API_URL import already exists
  if (!content.includes("import { API_URL }")) {
    // Add import after React import
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('import React') || lines[i].includes("import { ")) {
        insertIndex = i + 1;
        break;
      }
    }
    
    if (insertIndex > -1) {
      lines.splice(insertIndex, 0, 'import { API_URL } from "../config/api";');
      content = lines.join('\n');
    }
  }
  
  // Replace all localhost:5000/api with API_URL
  const originalContent = content;
  content = content.replace(/http:\/\/localhost:5000\/api/g, '${API_URL}');
  content = content.replace(/http:\/\/localhost:5000\//g, '${API_URL}/../');
  content = content.replace(/'http:\/\/localhost:5000\/api'/g, '`${API_URL}`');
  content = content.replace(/"http:\/\/localhost:5000\/api"/g, '`${API_URL}`');
  content = content.replace(/`http:\/\/localhost:5000\/api`/g, '`${API_URL}`');
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`🔄 No changes needed: ${filePath}`);
  }
});

console.log('\n🎉 All files processed!');
console.log('📝 Manual fixes might still be needed for complex cases.');
