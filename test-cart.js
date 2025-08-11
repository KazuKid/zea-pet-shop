// Test script untuk debugging cart
const testCart = async () => {
  const token = localStorage.getItem('token');
  
  console.log('=== DEBUGGING CART ===');
  console.log('Token:', token ? 'Ada' : 'Tidak ada');
  console.log('Username:', localStorage.getItem('username'));
  
  if (!token) {
    console.log('Tidak ada token, silakan login terlebih dahulu');
    return;
  }
  
  try {
    // Test GET cart
    console.log('\n1. Testing GET cart...');
    const getResponse = await fetch('http://localhost:5000/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (getResponse.ok) {
      const cartData = await getResponse.json();
      console.log('Cart dari database:', cartData);
    } else {
      console.log('Error GET cart:', await getResponse.text());
    }
    
    // Test POST cart
    console.log('\n2. Testing POST cart...');
    const testCartData = [
      {
        id_barang: 1,
        name: 'Test Product',
        price: 10000,
        quantity: 2,
        image: 'test.jpg'
      }
    ];
    
    const postResponse = await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cart: testCartData })
    });
    
    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('POST cart berhasil:', result);
    } else {
      console.log('Error POST cart:', await postResponse.text());
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Jalankan test
testCart();
