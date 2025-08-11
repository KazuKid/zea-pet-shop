import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';

const PaymentCallbackPage = () => {
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    // const statusCode = searchParams.get('status_code');
    // const transactionStatus = searchParams.get('transaction_status');

    if (orderId) {
      checkPaymentStatus(orderId);
    } else {
      // Jika tidak ada order_id di URL, redirect ke home
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate]);

  const checkPaymentStatus = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payment/status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
        setPaymentStatus(data.status);

        // Jika pembayaran berhasil, hapus cart
        if (data.status === 'success') {
          localStorage.removeItem('cart');
        }
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  const formatRupiah = (angka) => {
    return 'Rp' + angka.toLocaleString('id-ID');
  };

  const renderStatusContent = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="mt-3">Mengecek status pembayaran...</h4>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-success mb-3">
              <i className="fas fa-check-circle" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="text-success">Pembayaran Berhasil!</h2>
            <p className="lead">Terima kasih atas pembelian Anda</p>
            {orderDetails && (
              <div className="card mt-4">
                <div className="card-body">
                  <h5>Detail Pesanan</h5>
                  <p><strong>Order ID:</strong> {orderDetails.order_id}</p>
                  <p><strong>Total:</strong> {formatRupiah(orderDetails.total_amount)}</p>
                  <p><strong>Status:</strong> <span className="badge bg-success">Berhasil</span></p>
                  <p><strong>Tanggal:</strong> {new Date(orderDetails.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            )}
            <div className="mt-4">
              <button className="btn btn-primary me-2" onClick={() => navigate('/')}>
                Kembali ke Beranda
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/shop')}>
                Lanjut Belanja
              </button>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <div className="text-warning mb-3">
              <i className="fas fa-clock" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="text-warning">Pembayaran Pending</h2>
            <p className="lead">Pembayaran Anda sedang diproses</p>
            <p>Silakan selesaikan pembayaran atau tunggu konfirmasi.</p>
            <div className="mt-4">
              <button className="btn btn-primary me-2" onClick={() => window.location.reload()}>
                Refresh Status
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
                Kembali ke Beranda
              </button>
            </div>
          </div>
        );

      case 'failed':
      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="text-danger mb-3">
              <i className="fas fa-times-circle" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="text-danger">Pembayaran Gagal</h2>
            <p className="lead">Terjadi kesalahan pada pembayaran Anda</p>
            <p>Silakan coba lagi atau hubungi customer service.</p>
            <div className="mt-4">
              <button className="btn btn-danger me-2" onClick={() => navigate('/cart')}>
                Coba Lagi
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
                Kembali ke Beranda
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px', minHeight: '100vh' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {renderStatusContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
