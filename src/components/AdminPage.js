import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './AdminPage.css';
import { API_URL } from '../config/api';

const AdminPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nama_barang: '', harga: '', stok_barang: '', gambar_barang: '', id_kategori: '', deskripsi: '', id_barang: null });
  const [isEdit, setIsEdit] = useState(false);
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('produk'); // State untuk tab aktif
  const productsPerPage = 5;

  // State untuk search dan sorting produk
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nama_barang'); // Default sort by nama
  const [sortOrder, setSortOrder] = useState('asc'); // asc atau desc
  const [filterCategory, setFilterCategory] = useState(''); // Filter by category

  // State untuk ADMIN PEMBELI
  const [buyers, setBuyers] = useState([]);
  const [buyerForm, setBuyerForm] = useState({
    id_pembeli: null,
    username: '',
    password: '',
    nama_pembeli: '',
    negara_pembeli: '',
    provinsi_pembeli: '',
    kota_pembeli: '',
    alamat1_pembeli: '',
    kode_pos: '',
    ktp_pembeli: ''
  });
  const [isBuyerEdit, setIsBuyerEdit] = useState(false);
  const [buyerCurrentPage, setBuyerCurrentPage] = useState(1);
  const buyersPerPage = 5;

  // State untuk ADMIN PESANAN
  const [orders, setOrders] = useState([]);
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Cek role admin
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch products
  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    setProducts(data);
  };

  // Fetch kategori
  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/categories`);
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    setCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (activeTab === 'pembeli') {
      fetchBuyers();
    }
    if (activeTab === 'pesanan') {
      fetchOrders();
    }
  }, [activeTab]);

  // ===== FUNGSI UNTUK ADMIN PEMBELI =====
  
  // Fetch pembeli
  const fetchBuyers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/buyers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBuyers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
    }
  };

  // Handle buyer form change
  const handleBuyerChange = (e) => {
    setBuyerForm({ ...buyerForm, [e.target.name]: e.target.value });
  };

  // Handle buyer edit
  const handleBuyerEdit = (buyer) => {
    setBuyerForm({
      id_pembeli: buyer.id_pembeli,
      username: buyer.username,
      password: '', // Kosongkan password untuk keamanan
      nama_pembeli: buyer.nama_pembeli || '',
      negara_pembeli: buyer.negara_pembeli || '',
      provinsi_pembeli: buyer.provinsi_pembeli || '',
      kota_pembeli: buyer.kota_pembeli || '',
      alamat1_pembeli: buyer.alamat1_pembeli || '',
      kode_pos: buyer.kode_pos || '',
      ktp_pembeli: buyer.ktp_pembeli || ''
    });
    setIsBuyerEdit(true);
  };

  // Handle buyer submit (update)
  const handleBuyerSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        username: buyerForm.username,
        nama_pembeli: buyerForm.nama_pembeli,
        negara_pembeli: buyerForm.negara_pembeli,
        provinsi_pembeli: buyerForm.provinsi_pembeli,
        kota_pembeli: buyerForm.kota_pembeli,
        alamat1_pembeli: buyerForm.alamat1_pembeli,
        kode_pos: buyerForm.kode_pos,
        ktp_pembeli: buyerForm.ktp_pembeli
      };

      // Hanya tambahkan password jika diisi
      if (buyerForm.password.trim() !== '') {
        updateData.password = buyerForm.password;
      }

      const res = await fetch(`${API_URL}/buyers/${buyerForm.id_pembeli}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        fetchBuyers();
        setBuyerForm({
          id_pembeli: null,
          username: '',
          password: '',
          nama_pembeli: '',
          negara_pembeli: '',
          provinsi_pembeli: '',
          kota_pembeli: '',
          alamat1_pembeli: '',
          kode_pos: '',
          ktp_pembeli: ''
        });
        setIsBuyerEdit(false);
        alert('Data pembeli berhasil diperbarui');
      } else {
        alert('Gagal memperbarui data pembeli');
      }
    } catch (error) {
      console.error('Error updating buyer:', error);
      alert('Terjadi kesalahan saat memperbarui data pembeli');
    }
  };

  // Handle buyer delete
  const handleBuyerDelete = async (id_pembeli) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pembeli ini?')) {
      try {
        const res = await fetch(`${API_URL}/buyers/${id_pembeli}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (res.ok) {
          fetchBuyers();
          alert('Pembeli berhasil dihapus');
        } else {
          alert('Gagal menghapus pembeli');
        }
      } catch (error) {
        console.error('Error deleting buyer:', error);
        alert('Terjadi kesalahan saat menghapus pembeli');
      }
    }
  };

  // Reset buyer form
  const resetBuyerForm = () => {
    setBuyerForm({
      id_pembeli: null,
      username: '',
      password: '',
      nama_pembeli: '',
      negara_pembeli: '',
      provinsi_pembeli: '',
      kota_pembeli: '',
      alamat1_pembeli: '',
      kode_pos: '',
      ktp_pembeli: ''
    });
    setIsBuyerEdit(false);
  };

  // ===== END FUNGSI ADMIN PEMBELI =====

  // ===== FUNGSI UNTUK ADMIN PESANAN =====
  
  // Fetch pesanan
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Update status pesanan
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchOrders();
        alert('Status pesanan berhasil diperbarui');
      } else {
        alert('Gagal memperbarui status pesanan');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Terjadi kesalahan saat memperbarui status pesanan');
    }
  };

  // Batalkan pesanan
  const cancelOrder = async (orderId) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (res.ok) {
          fetchOrders();
          alert('Pesanan berhasil dibatalkan');
        } else {
          alert('Gagal membatalkan pesanan');
        }
      } catch (error) {
        console.error('Error canceling order:', error);
        alert('Terjadi kesalahan saat membatalkan pesanan');
      }
    }
  };

  // Format status untuk display
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Menunggu Pembayaran',
      'success': 'Dibayar',
      'failed': 'Gagal',
      'shipping': 'Pengiriman',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format rupiah
  const formatRupiah = (angka) => {
    return 'Rp' + angka.toLocaleString('id-ID');
  };

  // ===== END FUNGSI ADMIN PESANAN =====

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle edit
  const handleEdit = (product) => {
    setForm({
      nama_barang: product.nama_barang,
      harga: product.harga,
      stok_barang: product.stok_barang,
      gambar_barang: product.gambar_barang,
      id_kategori: product.id_kategori,
      deskripsi: product.deskripsi,
      id_barang: product.id_barang
    });
    setIsEdit(true);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nama_barang', form.nama_barang);
    formData.append('harga', form.harga);
    formData.append('stok_barang', form.stok_barang);
    formData.append('id_kategori', form.id_kategori);
    formData.append('deskripsi', form.deskripsi);
    if (file) {
      formData.append('gambar_barang', file);
    }

    const url = isEdit ? `${API_URL}/${form.id_barang}` : API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: formData
      });

      if (res.ok) {
        fetchProducts();
        setForm({ nama_barang: '', harga: '', stok_barang: '', gambar_barang: '', id_kategori: '', deskripsi: '', id_barang: null });
        setIsEdit(false);
        setFile(null);
        // Reset input file
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        alert(isEdit ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!');
      } else {
        const errorData = await res.json();
        alert(`Terjadi kesalahan: ${errorData.error || 'Gagal menyimpan produk'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan produk');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProducts();
        alert('Produk berhasil dihapus!');
      } else {
        alert('Terjadi kesalahan saat menghapus produk');
      }
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setForm({ nama_barang: '', harga: '', stok_barang: '', gambar_barang: '', id_kategori: '', deskripsi: '', id_barang: null });
    setIsEdit(false);
    setFile(null);
    // Reset input file
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Get category name
  const getCategoryName = (id) => {
    const category = categories.find(cat => cat.id_kategori === id);
    return category ? category.nama_kategori : 'Tidak diketahui';
  };

  // Fungsi untuk filtering dan sorting produk
  const getFilteredAndSortedProducts = () => {
    let filteredProducts = products;

    // Filter berdasarkan search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan kategori
    if (filterCategory) {
      filteredProducts = filteredProducts.filter(product =>
        product.id_kategori.toString() === filterCategory
      );
    }

    // Sorting
    filteredProducts.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'nama_barang':
          aValue = a.nama_barang.toLowerCase();
          bValue = b.nama_barang.toLowerCase();
          break;
        case 'harga':
          aValue = parseInt(a.harga) || 0;
          bValue = parseInt(b.harga) || 0;
          break;
        case 'stok_barang':
          aValue = parseInt(a.stok_barang) || 0;
          bValue = parseInt(b.stok_barang) || 0;
          break;
        case 'kategori':
          aValue = getCategoryName(a.id_kategori).toLowerCase();
          bValue = getCategoryName(b.id_kategori).toLowerCase();
          break;
        default:
          aValue = a.nama_barang.toLowerCase();
          bValue = b.nama_barang.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filteredProducts;
  };

  // Get filtered and sorted products
  const filteredProducts = getFilteredAndSortedProducts();

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Reset page when search/filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setSortBy('nama_barang');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  return (
    <div>
      <Navbar />
      
      {/* Mini Admin Navigation */}
      <div className="admin-nav">
        <div className="admin-nav-container">
          <button 
            className={`admin-nav-item ${activeTab === 'produk' ? 'active' : ''}`}
            onClick={() => setActiveTab('produk')}
          >
            ADMIN PRODUK
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'pembeli' ? 'active' : ''}`}
            onClick={() => setActiveTab('pembeli')}
          >
            ADMIN PEMBELI
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'pesanan' ? 'active' : ''}`}
            onClick={() => setActiveTab('pesanan')}
          >
            ADMIN PESANAN
          </button>
        </div>
      </div>

      <div className="admin-container">
        {/* Konten berdasarkan tab yang aktif */}
        {activeTab === 'produk' && (
          <div>
            <h2>Kelola Produk</h2>
        
        {/* Form untuk menambah/edit produk */}
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="text"
            name="nama_barang"
            placeholder="Nama Barang"
            value={form.nama_barang}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="harga"
            placeholder="Harga"
            value={form.harga}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="stok_barang"
            placeholder="Stok"
            value={form.stok_barang}
            onChange={handleChange}
            required
          />
          <select
            name="id_kategori"
            value={form.id_kategori}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Kategori</option>
            {categories.map(cat => (
              <option key={cat.id_kategori} value={cat.id_kategori}>
                {cat.nama_kategori}
              </option>
            ))}
          </select>
          <textarea
            name="deskripsi"
            placeholder="Deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            rows="2"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required={!isEdit}
          />
          <button type="submit">
            {isEdit ? 'Perbarui' : 'Tambah'}
          </button>
          {isEdit && (
            <button type="button" onClick={handleCancelEdit}>
              Batal
            </button>
          )}
        </form>

        {/* Search dan Filter Controls */}
        <div className="product-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama atau deskripsi..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="filter-sort-container">
            <div className="filter-group">
              <label>Filter Kategori:</label>
              <select 
                value={filterCategory} 
                onChange={handleCategoryFilterChange}
                className="filter-select"
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id_kategori} value={cat.id_kategori}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div className="sort-group">
              <label>Urutkan berdasarkan:</label>
              <select 
                value={sortBy} 
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="nama_barang">Nama Produk</option>
                <option value="harga">Harga</option>
                <option value="stok_barang">Stok</option>
                <option value="kategori">Kategori</option>
              </select>
              <button 
                onClick={handleSortOrderToggle}
                className="sort-order-btn"
                title={`Urutan: ${sortOrder === 'asc' ? 'A-Z / Rendah-Tinggi' : 'Z-A / Tinggi-Rendah'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="reset-group">
              <button 
                onClick={handleResetFilters}
                className="reset-btn"
                title="Reset semua filter dan pencarian"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          <div className="results-info">
            Menampilkan {currentProducts.length} dari {filteredProducts.length} produk
            {searchTerm && ` (hasil pencarian: "${searchTerm}")`}
            {filterCategory && ` (kategori: ${getCategoryName(parseInt(filterCategory))})`}
          </div>
        </div>

        {/* Tabel produk */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Gambar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map(product => (
                <tr key={product.id_barang}>
                  <td>{product.nama_barang}</td>
                  <td>Rp {product.harga?.toLocaleString()}</td>
                  <td>{product.stok_barang}</td>
                  <td>{getCategoryName(product.id_kategori)}</td>
                  <td>{product.deskripsi}</td>
                  <td>
                    {product.gambar_barang && (
                      <img
                        src={`/${product.gambar_barang}`}
                        alt={product.nama_barang}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(product)}>Edit</button>
                    <button onClick={() => handleDelete(product.id_barang)} className="delete">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                  {filteredProducts.length === 0 
                    ? (searchTerm || filterCategory 
                        ? 'Tidak ada produk yang sesuai dengan pencarian atau filter.'
                        : 'Belum ada produk yang ditambahkan.'
                      )
                    : 'Tidak ada data pada halaman ini.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            <span>Halaman {currentPage} dari {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </button>
          </div>
        )}
          </div>
        )}

        {/* Tab ADMIN PEMBELI */}
        {activeTab === 'pembeli' && (
          <div>
            <h2>Kelola Pembeli</h2>
            
            {/* Form Edit Pembeli */}
            {isBuyerEdit && (
              <div className="buyer-form-container">
                <h3>Edit Data Pembeli</h3>
                <form onSubmit={handleBuyerSubmit} className="buyer-form">
                  <div className="form-row">
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={buyerForm.username}
                      onChange={handleBuyerChange}
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password (kosongkan jika tidak ingin mengubah)"
                      value={buyerForm.password}
                      onChange={handleBuyerChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      name="nama_pembeli"
                      placeholder="Nama Lengkap"
                      value={buyerForm.nama_pembeli}
                      onChange={handleBuyerChange}
                    />
                    <input
                      type="text"
                      name="negara_pembeli"
                      placeholder="Negara"
                      value={buyerForm.negara_pembeli}
                      onChange={handleBuyerChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      name="provinsi_pembeli"
                      placeholder="Provinsi"
                      value={buyerForm.provinsi_pembeli}
                      onChange={handleBuyerChange}
                    />
                    <input
                      type="text"
                      name="kota_pembeli"
                      placeholder="Kota"
                      value={buyerForm.kota_pembeli}
                      onChange={handleBuyerChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      name="alamat1_pembeli"
                      placeholder="Alamat"
                      value={buyerForm.alamat1_pembeli}
                      onChange={handleBuyerChange}
                    />
                    <input
                      type="text"
                      name="kode_pos"
                      placeholder="Kode Pos"
                      value={buyerForm.kode_pos}
                      onChange={handleBuyerChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      name="ktp_pembeli"
                      placeholder="KTP"
                      value={buyerForm.ktp_pembeli}
                      onChange={handleBuyerChange}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      Simpan Perubahan
                    </button>
                    <button type="button" onClick={resetBuyerForm} className="btn-secondary">
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabel Pembeli */}
            <div className="buyers-table-container">
              <table className="buyers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Nama Lengkap</th>
                    <th>Negara</th>
                    <th>Provinsi</th>
                    <th>Kota</th>
                    <th>Alamat</th>
                    <th>Kode Pos</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                        Tidak ada data pembeli
                      </td>
                    </tr>
                  ) : (
                    buyers
                      .slice((buyerCurrentPage - 1) * buyersPerPage, buyerCurrentPage * buyersPerPage)
                      .map(buyer => (
                        <tr key={buyer.id_pembeli}>
                          <td>{buyer.id_pembeli}</td>
                          <td>{buyer.username}</td>
                          <td>{buyer.nama_pembeli || '-'}</td>
                          <td>{buyer.negara_pembeli || '-'}</td>
                          <td>{buyer.provinsi_pembeli || '-'}</td>
                          <td>{buyer.kota_pembeli || '-'}</td>
                          <td>{buyer.alamat1_pembeli || '-'}</td>
                          <td>{buyer.kode_pos || '-'}</td>
                          <td>
                            <button 
                              onClick={() => handleBuyerEdit(buyer)} 
                              className="btn-edit"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleBuyerDelete(buyer.id_pembeli)} 
                              className="btn-delete"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>

              {/* Pagination untuk Pembeli */}
              {Math.ceil(buyers.length / buyersPerPage) > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setBuyerCurrentPage(buyerCurrentPage - 1)}
                    disabled={buyerCurrentPage === 1}
                  >
                    Sebelumnya
                  </button>
                  <span>
                    Halaman {buyerCurrentPage} dari {Math.ceil(buyers.length / buyersPerPage)}
                  </span>
                  <button 
                    onClick={() => setBuyerCurrentPage(buyerCurrentPage + 1)}
                    disabled={buyerCurrentPage === Math.ceil(buyers.length / buyersPerPage)}
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab ADMIN PESANAN */}
        {activeTab === 'pesanan' && (
          <div>
            <h2>Kelola Pesanan</h2>
            
            {/* Tabel Pesanan */}
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Pembeli</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Items</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        Tidak ada data pesanan
                      </td>
                    </tr>
                  ) : (
                    orders
                      .slice((orderCurrentPage - 1) * ordersPerPage, orderCurrentPage * ordersPerPage)
                      .map(order => (
                        <tr key={order.order_id}>
                          <td title={order.order_id}>
                            {order.order_id.substring(0, 15)}...
                          </td>
                          <td>
                            <div>
                              <strong>{order.nama_pembeli || order.username}</strong>
                              <br />
                              <small>{order.username}</small>
                            </div>
                          </td>
                          <td>{formatRupiah(order.total_amount)}</td>
                          <td>
                            <span className={`status-badge status-${order.status}`}>
                              {formatStatus(order.status)}
                            </span>
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <div className="items-list">
                              {order.items && order.items.map((item, index) => (
                                <div key={index} className="item-detail">
                                  <small>
                                    {item.nama_barang} x{item.quantity}
                                  </small>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="order-actions">
                              {order.status === 'success' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.order_id, 'shipping')}
                                  className="btn-shipping"
                                  title="Ubah ke Pengiriman"
                                >
                                  Kirim
                                </button>
                              )}
                              {order.status === 'shipping' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.order_id, 'completed')}
                                  className="btn-complete"
                                  title="Ubah ke Selesai"
                                >
                                  Selesai
                                </button>
                              )}
                              {(order.status === 'pending' || order.status === 'success' || order.status === 'shipping') && (
                                <button 
                                  onClick={() => cancelOrder(order.order_id)}
                                  className="btn-cancel"
                                  title="Batalkan Pesanan"
                                >
                                  Batal
                                </button>
                              )}
                              {(order.status === 'completed' || order.status === 'failed' || order.status === 'cancelled') && (
                                <span className="no-action">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>

              {/* Pagination untuk Pesanan */}
              {Math.ceil(orders.length / ordersPerPage) > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setOrderCurrentPage(orderCurrentPage - 1)}
                    disabled={orderCurrentPage === 1}
                  >
                    Sebelumnya
                  </button>
                  <span>
                    Halaman {orderCurrentPage} dari {Math.ceil(orders.length / ordersPerPage)}
                  </span>
                  <button 
                    onClick={() => setOrderCurrentPage(orderCurrentPage + 1)}
                    disabled={orderCurrentPage === Math.ceil(orders.length / ordersPerPage)}
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
