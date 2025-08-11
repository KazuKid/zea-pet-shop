import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './AdminPage.css';

const API_URL = 'http://localhost:5000/api/products';

const AdminPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nama_barang: '', harga: '', stok_barang: '', gambar_barang: '', id_kategori: '', deskripsi: '', id_barang: null });
  const [isEdit, setIsEdit] = useState(false);
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  
  // State untuk menu dan data pembeli
  const [activeMenu, setActiveMenu] = useState('products'); // 'products' atau 'customers'
  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState({
    id_pembeli: null,
    username: '',
    password: '',
    nama_pembeli: '',
    negara_pembeli: '',
    provinsi_pembeli: '',
    kota_pembeli: '',
    alamat1_pembeli: '',
    kode_pos: ''
  });
  const [isEditCustomer, setIsEditCustomer] = useState(false);
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const customersPerPage = 5;

  // Cek role admin
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch products
  const fetchProducts = async () => {
    const res = await fetch(API_URL);
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    setProducts(data);
  };

  // Fetch kategori
  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/api/categories');
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    setCategories(data);
  };

  // Fetch customers
  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/pembeli', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    setCustomers(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setForm({ ...form, gambar_barang: e.target.files[0] ? e.target.files[0].name : '' });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let gambarFileName = form.gambar_barang;
    // Upload file gambar jika ada file baru
    if (file) {
      const uploadData = new FormData();
      uploadData.append('gambar', file);
      const uploadRes = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      gambarFileName = uploadJson.filename;
    }
    // Kirim data produk ke backend
    const produkData = {
      ...form,
      gambar_barang: gambarFileName
    };
    if (isEdit) {
      await fetch(`${API_URL}/${form.id_barang}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produkData),
      });
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produkData),
      });
    }
    setForm({ nama_barang: '', harga: '', stok_barang: '', gambar_barang: '', id_kategori: '', deskripsi: '', id_barang: null });
    setFile(null);
    setIsEdit(false);
    fetchProducts();
  };

  // Handle edit
  const handleEdit = (product) => {
    setForm(product);
    setIsEdit(true);
  };

  // Handle delete
  const handleDelete = async (id_barang) => {
    await fetch(`${API_URL}/${id_barang}`, { method: 'DELETE' });
    fetchProducts();
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle customer form change
  const handleCustomerChange = (e) => {
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
  };

  // Handle customer edit
  const handleCustomerEdit = (customer) => {
    setCustomerForm({
      id_pembeli: customer.id_pembeli,
      username: customer.username,
      password: customer.password,
      nama_pembeli: customer.nama_pembeli || '',
      negara_pembeli: customer.negara_pembeli || '',
      provinsi_pembeli: customer.provinsi_pembeli || '',
      kota_pembeli: customer.kota_pembeli || '',
      alamat1_pembeli: customer.alamat1_pembeli || '',
      kode_pos: customer.kode_pos || ''
    });
    setIsEditCustomer(true);
  };

  // Handle customer submit
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (isEditCustomer) {
      const res = await fetch(`http://localhost:5000/api/pembeli/${customerForm.id_pembeli}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(customerForm)
      });
      
      if (res.ok) {
        alert('Data pembeli berhasil diupdate');
        setIsEditCustomer(false);
        setCustomerForm({
          id_pembeli: null,
          username: '',
          password: '',
          nama_pembeli: '',
          negara_pembeli: '',
          provinsi_pembeli: '',
          kota_pembeli: '',
          alamat1_pembeli: '',
          kode_pos: ''
        });
        fetchCustomers();
      }
    }
  };

  // Handle customer delete
  const handleCustomerDelete = async (id_pembeli) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pembeli ini?')) {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/pembeli/${id_pembeli}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        alert('Data pembeli berhasil dihapus');
        fetchCustomers();
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="admin-layout">
        {/* Sidebar Menu */}
        <div className="admin-sidebar">
          <h3>Menu Admin</h3>
          <ul className="admin-menu">
            <li 
              className={activeMenu === 'products' ? 'active' : ''}
              onClick={() => setActiveMenu('products')}
            >
              📦 Kelola Produk
            </li>
            <li 
              className={activeMenu === 'customers' ? 'active' : ''}
              onClick={() => setActiveMenu('customers')}
            >
              👥 Kelola Pembeli
            </li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="admin-main-content">
          {activeMenu === 'products' && (
            <div className="admin-container">
              <h2>Kelola Produk</h2>
              <form className="admin-form" onSubmit={handleSubmit}>
                <select
                  name="id_kategori"
                  value={form.id_kategori}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="nama_barang"
                  placeholder="Nama Produk"
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
                <input
                  type="file"
                  name="gambar_barang"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <textarea
                  name="deskripsi"
                  placeholder="Deskripsi Produk"
                  value={form.deskripsi}
                  onChange={handleChange}
                  required
                  style={{resize:'vertical', minHeight:40}}
                />
                <button type="submit">{isEdit ? 'Update' : 'Tambah'}</button>
                {isEdit && <button type="button" onClick={() => { setIsEdit(false); setForm({ nama_barang: '', harga: '', stok_barang: '', gambar_barang: '', id_kategori: '', deskripsi: '', id_barang: null }); }}>Batal</button>}
              </form>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Nama Produk</th>
                    <th>Harga</th>
                    <th>Stok</th>
                    <th>Gambar</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((p) => (
                    <tr key={p.id_barang}>
                      <td>{categories.find(c => c.id_kategori === p.id_kategori)?.nama_kategori || '-'}</td>
                      <td>{p.nama_barang}</td>
                      <td>Rp{Number(p.harga).toLocaleString('id-ID')}</td>
                      <td>{p.stok_barang}</td>
                      <td>
                        {p.gambar_barang && <img src={"/" + p.gambar_barang} alt={p.nama_barang} style={{width:50, height:50, objectFit:'cover'}} />}
                      </td>
                      <td>{p.deskripsi}</td>
                      <td>
                        <button onClick={() => handleEdit(p)}>Edit</button>
                        <button onClick={() => handleDelete(p.id_barang)} className="delete">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </button>
                  <span>Halaman {currentPage} dari {totalPages}</span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          )}

          {activeMenu === 'customers' && (
            <div className="admin-container">
              <h2>Kelola Data Pembeli</h2>
              
              {isEditCustomer && (
                <form className="admin-form" onSubmit={handleCustomerSubmit}>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={customerForm.username}
                    onChange={handleCustomerChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={customerForm.password}
                    onChange={handleCustomerChange}
                    required
                  />
                  <input
                    type="text"
                    name="nama_pembeli"
                    placeholder="Nama Lengkap"
                    value={customerForm.nama_pembeli}
                    onChange={handleCustomerChange}
                  />
                  <input
                    type="text"
                    name="negara_pembeli"
                    placeholder="Negara"
                    value={customerForm.negara_pembeli}
                    onChange={handleCustomerChange}
                  />
                  <input
                    type="text"
                    name="provinsi_pembeli"
                    placeholder="Provinsi"
                    value={customerForm.provinsi_pembeli}
                    onChange={handleCustomerChange}
                  />
                  <input
                    type="text"
                    name="kota_pembeli"
                    placeholder="Kota"
                    value={customerForm.kota_pembeli}
                    onChange={handleCustomerChange}
                  />
                  <input
                    type="text"
                    name="alamat1_pembeli"
                    placeholder="Alamat"
                    value={customerForm.alamat1_pembeli}
                    onChange={handleCustomerChange}
                  />
                  <input
                    type="text"
                    name="kode_pos"
                    placeholder="Kode Pos"
                    value={customerForm.kode_pos}
                    onChange={handleCustomerChange}
                  />
                  <button type="submit">Update Pembeli</button>
                  <button type="button" onClick={() => { setIsEditCustomer(false); setCustomerForm({ id_pembeli: null, username: '', password: '', nama_pembeli: '', negara_pembeli: '', provinsi_pembeli: '', kota_pembeli: '', alamat1_pembeli: '', kode_pos: '' }); }}>Batal</button>
                </form>
              )}
              
              <table className="admin-table">
                <thead>
                  <tr>
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
                  {customers.slice((currentCustomerPage - 1) * customersPerPage, currentCustomerPage * customersPerPage).map((c) => (
                    <tr key={c.id_pembeli}>
                      <td>{c.username}</td>
                      <td>{c.nama_pembeli}</td>
                      <td>{c.negara_pembeli}</td>
                      <td>{c.provinsi_pembeli}</td>
                      <td>{c.kota_pembeli}</td>
                      <td>{c.alamat1_pembeli}</td>
                      <td>{c.kode_pos}</td>
                      <td>
                        <button onClick={() => handleCustomerEdit(c)}>Edit</button>
                        <button onClick={() => handleCustomerDelete(c.id_pembeli)} className="delete">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination for customers */}
              {Math.ceil(customers.length / customersPerPage) > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentCustomerPage(currentCustomerPage - 1)}
                    disabled={currentCustomerPage === 1}
                  >
                    Sebelumnya
                  </button>
                  <span>Halaman {currentCustomerPage} dari {Math.ceil(customers.length / customersPerPage)}</span>
                  <button 
                    onClick={() => setCurrentCustomerPage(currentCustomerPage + 1)}
                    disabled={currentCustomerPage === Math.ceil(customers.length / customersPerPage)}
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
