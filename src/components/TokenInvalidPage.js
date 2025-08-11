import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TokenInvalidPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLoginNow = () => {
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-warning">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Session Security Update
              </h5>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                <i className="fas fa-shield-alt fa-3x text-warning mb-3"></i>
                <h4>Security Enhancement Applied</h4>
                <p className="text-muted">
                  Sistem keamanan telah diperbarui untuk melindungi akun Anda dengan lebih baik.
                </p>
              </div>
              
              <div className="alert alert-info" role="alert">
                <strong>Apa yang terjadi?</strong><br/>
                Session security key telah diperbarui. Semua session lama akan otomatis dihapus
                untuk memastikan keamanan maksimal.
              </div>

              <div className="mb-4">
                <h6>Yang perlu Anda lakukan:</h6>
                <ol className="text-start">
                  <li>Login kembali dengan username dan password Anda</li>
                  <li>Session baru akan lebih aman dan tahan lama (8 jam)</li>
                  <li>Tidak ada data yang hilang dari akun Anda</li>
                </ol>
              </div>

              <button 
                className="btn btn-primary btn-lg"
                onClick={handleLoginNow}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                Login Sekarang
              </button>
              
              <p className="text-muted mt-3">
                <small>Anda akan diarahkan ke halaman login dalam 5 detik...</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInvalidPage;
