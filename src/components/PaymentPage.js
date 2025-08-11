import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './PaymentPage.css';
import { makeAuthenticatedRequest, isTokenValid, setupAutoLogout, clearInvalidToken } from '../utils/auth';

const PaymentPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    nama_pembeli: '',
    email: '',
    no_hp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Setup auto logout on component mount
  useEffect(() => {
    // Only setup auto logout if user is logged in
    const token = localStorage.getItem('token');
    if (token && isTokenValid()) {
      setupAutoLogout();
    }
  }, []);

  // Format rupiah
  const formatRupiah = (angka) => {
    return 'Rp' + angka.toLocaleString('id-ID');
  };

  // Load cart dan customer details
  useEffect(() => {
    // Clear any invalid tokens first
    clearInvalidToken();
    
    // Check if user is logged in and token is valid
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token || !username || !isTokenValid()) {
      alert('Anda belum login atau sesi telah berakhir. Silakan login terlebih dahulu.');
      navigate('/login');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);

    // Load customer details
    const loadCustomerDetails = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const response = await makeAuthenticatedRequest(
            `http://localhost:5000/api/pembeli-info?username=${encodeURIComponent(username)}`
          );
          
          if (response && response.ok) {
            const data = await response.json();
            setCustomerDetails({
              nama_pembeli: data.nama_pembeli || '',
              email: data.email_pembeli || '',
              no_hp: data.notelp_pembeli || ''
            });
          }
        } catch (error) {
          console.error('Error loading customer details:', error);
        }
      }
    };

    loadCustomerDetails();
  }, [navigate]);

  const handleCustomerDetailsChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      alert('Keranjang kosong!');
      return;
    }

    if (!customerDetails.nama_pembeli || !customerDetails.email || !customerDetails.no_hp) {
      alert('Harap lengkapi data pembeli!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/payment/create', {
        method: 'POST',
        body: JSON.stringify({
          items: cartItems,
          customerDetails: customerDetails,
          totalAmount: calculateTotal()
        })
      });

      if (!response) {
        setIsLoading(false);
        return; // Token expired, user redirected to login
      }

      const data = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (data.success) {
        // Redirect ke Midtrans payment page
        window.location.href = data.redirect_url;
      } else {
        alert('Gagal membuat transaksi: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container payment-page">
        <div className="row">
          {/* Order Summary */}
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5>Ringkasan Pesanan</h5>
              </div>
              <div className="card-body">
                {cartItems.map(item => (
                  <div key={item.id_barang} className="row mb-3 align-items-center">
                    <div className="col-2">
                      <img 
                        src={item.image ? `http://localhost:5000/${item.image}` : 'https://via.placeholder.com/80'} 
                        alt={item.name} 
                        className="img-fluid rounded"
                        style={{ maxHeight: '80px' }}
                      />
                    </div>
                    <div className="col-6">
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">{formatRupiah(item.price)} × {item.quantity}</small>
                    </div>
                    <div className="col-4 text-end">
                      <strong>{formatRupiah(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                ))}
                <hr />
                <div className="row">
                  <div className="col-8">
                    <h5>Total</h5>
                  </div>
                  <div className="col-4 text-end">
                    <h5>{formatRupiah(calculateTotal())}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details & Payment */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5>Data Pembeli</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nama_pembeli"
                    value={customerDetails.nama_pembeli}
                    onChange={handleCustomerDetailsChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={customerDetails.email}
                    onChange={handleCustomerDetailsChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">No. HP</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="no_hp"
                    value={customerDetails.no_hp}
                    onChange={handleCustomerDetailsChange}
                    required
                  />
                </div>

                <button 
                  className="btn btn-success w-100 btn-lg"
                  onClick={handlePayment}
                  disabled={isLoading || cartItems.length === 0}
                >
                  {isLoading ? 'Memproses...' : `Bayar ${formatRupiah(calculateTotal())}`}
                </button>

                <button 
                  className="btn btn-secondary w-100 mt-2"
                  onClick={() => navigate('/cart')}
                >
                  Kembali ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
