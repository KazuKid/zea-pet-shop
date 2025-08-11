import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
    }
  }, [navigate]);

  // Fungsi untuk format rupiah
  const formatRupiah = (angka) => {
    return 'Rp' + angka.toLocaleString('id-ID');
  };

  // Fungsi untuk menyimpan cart ke database
  const saveCartToDatabase = async (cart) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cart })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan cart ke database');
      }
    } catch (error) {
      console.error('Error saving cart:', error);
      alert(`Terjadi kesalahan saat menyimpan cart: ${error.message}`);
    }
  };

  // Load cart from database when component mounts
  useEffect(() => {
    const loadCartFromDatabase = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Jika tidak ada token, ambil dari localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const cart = await response.json();
          setCartItems(cart);
          // Sync dengan localStorage
          localStorage.setItem('cart', JSON.stringify(cart));
        } else {
          // Jika gagal, gunakan localStorage
          const cart = JSON.parse(localStorage.getItem('cart')) || [];
          setCartItems(cart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Jika gagal, gunakan localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);
      }
    };

    loadCartFromDatabase();
  }, []);

  const handleQuantityChange = async (id_barang, action) => {
    const updatedCart = cartItems.map(item =>
      item.id_barang === id_barang
        ? { ...item, quantity: action === 'increment' ? item.quantity + 1 : Math.max(1, item.quantity - 1) }
        : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Simpan ke database
    await saveCartToDatabase(updatedCart);
  };

  const handleRemove = async (id_barang) => {
    const updatedCart = cartItems.filter(item => item.id_barang !== id_barang);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Simpan ke database
    await saveCartToDatabase(updatedCart);
  };

  const applyCoupon = () => {
    if (coupon === 'DISCOUNT10') {
      setDiscount(10);
    } else {
      alert('Invalid Coupon Code');
      setDiscount(0);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const discountedTotal = total - discount;

  return (
    <div>
      <Navbar />
      <div className="container-fluid cart-page">
        <div className="row">
          {/* Cart Items */}
          <div className="col-lg-9">
            {cartItems.length === 0 ? (
              <div className="text-center py-5">
                <h4>Keranjang Anda kosong</h4>
                <p>Silakan tambahkan produk ke keranjang terlebih dahulu</p>
                <button className="btn btn-primary" onClick={() => navigate('/shop')}>
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>PRODUK</th>
                    <th>JUMLAH</th>
                    <th>HARGA</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.id_barang}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={item.image ? `http://localhost:5000/${item.image}` : 'https://via.placeholder.com/50'} alt={item.name} className="cart-item-image" />
                          <div className="ms-3">
                            <h6>{item.name}</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="quantity-control">
                          <button onClick={() => handleQuantityChange(item.id_barang, 'decrement')} className="btn btn-outline-secondary btn-sm">-</button>
                          <span className="mx-2">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id_barang, 'increment')} className="btn btn-outline-secondary btn-sm">+</button>
                        </div>
                      </td>
                      <td>
                        <p className="mb-0">{formatRupiah((item.price || 0) * (item.quantity || 0))}</p>
                        <small>{formatRupiah(item.price || 0)} each</small>
                      </td>
                      <td>
                        <button onClick={() => handleRemove(item.id_barang)} className="btn btn-danger btn-sm">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Coupon and Total */}
          <div className="col-lg-3">
            <div className="card">
              <div className="card-body">
                <h6>Apakah anda punya coupon?</h6>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={applyCoupon}>Apply</button>
                </div>
                <div className="mb-3">
                  <p>Total Harga: {formatRupiah(total)}</p>
                  <p>Discount: -{formatRupiah(discount)}</p>
                  <h5>Total: {formatRupiah(discountedTotal)}</h5>
                </div>
                <button 
                  className="btn btn-success w-100 mb-2" 
                  disabled={cartItems.length === 0}
                  onClick={() => navigate('/payment')}
                >
                  Pembayaran
                </button>
                <button className="btn btn-secondary w-100" onClick={() => navigate('/shop')}>
                  Lanjut belanja
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;