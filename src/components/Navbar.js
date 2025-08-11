import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Pastikan Anda memiliki file CSS untuk navbar

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'admin');
    setUsername(localStorage.getItem('username') || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('cart');
    setShowMenu(false);
    navigate('/login');
  };

  return (
    <header>
      <div className="navbar-top">
        <p>Selamat Datang!</p>
      </div>
      <div className="navbar-main">
        <div className="logo">
          <Link to="/">
            <img src="logopetshop.png" alt="Logo Zea Pet Shop" />
          </Link>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/shop">SHOP</Link>
            </li>
            <li>
              <Link to="/cart">CART</Link>
            </li>
            <li>
              <Link to="/account">ACCOUNT</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin">ADMIN</Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="auth" style={{ position: 'relative' }}>
          {username ? (
            <div
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowMenu((v) => !v)}
            >
              <span className="login-link">{username}</span>
              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 6,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '8px 16px',
                      width: '100%',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#d90429',
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-link">
              Login/Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;