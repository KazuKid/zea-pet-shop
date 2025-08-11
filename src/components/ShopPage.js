import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './ShopPage.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []));
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  // Sync selectedCategory with URL param
  useEffect(() => {
    const kategoriParam = query.get('kategori');
    setSelectedCategory(kategoriParam || '');
  }, [location.search]);

  // Saat user klik kategori di ShopPage, update URL agar bisa navigasi antar kategori
  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
    if (id) {
      navigate(`/shop?kategori=${id}`);
    } else {
      navigate('/shop');
    }
  };

  // Fungsi untuk menambah ke cart (localStorage)
  const handleAddToCart = async (product) => {
    const isLoggedIn = localStorage.getItem('role');
    if (!isLoggedIn) {
      alert('Anda harus login terlebih dahulu untuk menambahkan produk ke keranjang.');
      navigate('/login');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const idx = cart.findIndex(item => item.id_barang === product.id_barang);
    
    if (idx !== -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      // Pastikan format data sesuai dengan yang diharapkan CartPage
      cart.push({
        id_barang: product.id_barang,
        name: product.nama_barang,
        price: product.harga,
        image: product.gambar_barang,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produk berhasil ditambahkan ke cart!');

    // Kirim data cart ke backend
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cart: cart })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan cart ke database');
      }
    } catch (error) {
      console.error(error);
      alert(`Terjadi kesalahan saat menyimpan cart: ${error.message}`);
    }
  };

  // Load cart from database when the user logs in
  useEffect(() => {
    const loadCartFromDatabase = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // URL endpoint sekarang tidak memerlukan query parameter username
        const response = await fetch(`http://localhost:5000/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const cart = await response.json();
          if (cart && cart.length > 0) {
             localStorage.setItem('cart', JSON.stringify(cart));
          } else {
             // Jika keranjang di DB kosong, pastikan localStorage juga kosong
             localStorage.removeItem('cart');
          }
        } else {
          console.error('Gagal memuat cart dari database');
        }
      } catch (error) {
        console.error('Terjadi kesalahan saat memuat cart:', error);
      }
    };

    loadCartFromDatabase();
    // Dependensi diubah ke location.state.isLoggedIn untuk memuat ulang saat login berhasil
  }, [location.state?.isLoggedIn]);

  const handleLogin = async () => {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('token', token);
      alert('Login berhasil!');
    } else {
      alert('Login gagal!');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => String(p.id_kategori) === String(selectedCategory))
    : products;

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset halaman ketika kategori berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <div>
      <Navbar />
      <div className="container-fluid shop-page">
        <div className="row">
          {/* Sidebar Kategori */}
          <div className="col-lg-3 col-md-4 sidebar">
            <div className="filter-section">
              <h6>Kategori</h6>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id="all-categories"
                  checked={selectedCategory === ''}
                  onChange={() => handleCategoryChange('')}
                />
                <label className="form-check-label" htmlFor="all-categories">
                  Semua Kategori
                </label>
              </div>
              {categories.map((cat) => (
                <div key={cat.id_kategori} className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id={`category-${cat.id_kategori}`}
                    checked={String(selectedCategory) === String(cat.id_kategori)}
                    onChange={() => handleCategoryChange(cat.id_kategori)}
                  />
                  <label className="form-check-label" htmlFor={`category-${cat.id_kategori}`}>
                    {cat.nama_kategori}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Product Grid */}
          <div className="col-lg-9 col-md-8">
            <div className="row">
              {currentProducts.length === 0 && (
                <div className="col-12 text-center mt-5">Tidak ada produk tersedia.</div>
              )}
              {currentProducts.map((product) => (
                <div className="col-lg-4 col-md-6 mb-4" key={product.id_barang}>
                  <div className="card product-card">
                    <img src={product.gambar_barang ? `/${product.gambar_barang}` : 'https://via.placeholder.com/150'} className="card-img-top" alt={product.nama_barang} />
                    <div className="card-body">
                      <h5 className="card-title">{product.nama_barang}</h5>
                      <p className="card-text">Rp{Number(product.harga).toLocaleString('id-ID')}</p>
                      <p className="card-text">Stok: {product.stok_barang}</p>
                      <button className="btn btn-primary btn-block mt-3" onClick={() => handleAddToCart(product)}>Beli</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </button>
                <span className="pagination-info">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
