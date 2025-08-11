import React, { useEffect, useState, useRef } from 'react';
import Navbar from './Navbar';
import './AccountPage.css';
// Removed unused imports for now

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('data-akun');
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false); // Ref to track loading state for intervals
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const username = localStorage.getItem('username');

  // Fetch user data
  const fetchUserData = async () => {
    if (username) {
      try {
        const res = await fetch(`http://localhost:5000/api/pembeli-info?username=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          // Normalize data untuk konsistensi dengan form
          const normalizedData = {
            ...data,
            email: data.email_pembeli || '',
            no_hp: data.notelp_pembeli || ''
          };
          setUser(normalizedData);
          setEditedUser(normalizedData); // Set initial edited user data
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({...user});
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({...user});
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    // Validasi form
    if (!editedUser.nama_pembeli || !editedUser.email) {
      alert('Nama dan email harus diisi!');
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      alert('Format email tidak valid!');
      return;
    }

    // Validasi no HP (hanya angka)
    if (editedUser.no_hp && !/^\d+$/.test(editedUser.no_hp)) {
      alert('No. HP harus berupa angka!');
      return;
    }

    // Validasi kode pos (hanya angka)
    if (editedUser.kode_pos && !/^\d+$/.test(editedUser.kode_pos)) {
      alert('Kode pos harus berupa angka!');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username,
          ...editedUser
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(editedUser);
        setIsEditing(false);
        alert('Data berhasil diperbarui!');
      } else {
        alert('Gagal memperbarui data: ' + (data.error || data.message));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter orders based on search term and status filter
  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = (order.items || []).filter(item => item && item.nama_barang).some(item => 
      item.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || order.order_id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort filtered orders
  const sortedFilteredOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.tanggal_order) - new Date(a.tanggal_order);
      case 'oldest':
        return new Date(a.tanggal_order) - new Date(b.tanggal_order);
      case 'highest':
        return b.total_harga - a.total_harga;
      case 'lowest':
        return a.total_harga - b.total_harga;
      default:
        return new Date(b.tanggal_order) - new Date(a.tanggal_order);
    }
  });

  // Get order counts for each status
  const getOrderCounts = () => {
    const counts = {
      all: (orders || []).length,
      pending: (orders || []).filter(order => order.status === 'pending').length,
      processing: (orders || []).filter(order => order.status === 'processing').length,
      shipped: (orders || []).filter(order => order.status === 'shipped').length,
      delivered: (orders || []).filter(order => order.status === 'delivered').length,
      cancelled: (orders || []).filter(order => order.status === 'cancelled').length
    };
    return counts;
  };

  const orderCounts = getOrderCounts();

  // Fetch user orders
  const fetchUserOrders = async () => {
    if (username && !isLoadingRef.current) { // Prevent concurrent requests using ref
      setIsLoading(true);
      isLoadingRef.current = true;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/user-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.orders) {
            setOrders(data.orders);
          } else {
            setOrders([]);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
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

  useEffect(() => {
    fetchUserData();
    if (activeTab === 'status-pesanan') {
      fetchUserOrders();
      
      // Auto refresh setiap 30 detik untuk status pesanan
      const interval = setInterval(() => {
        if (!isLoadingRef.current) { // Only refresh if not currently loading
          fetchUserOrders();
        }
      }, 30000);
      
      return () => {
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, activeTab]); // Removed function dependencies to prevent infinite loop

  if (!username) {
    return (
      <div>
        <Navbar />
        <div className="container mt-5 text-center">
          <h3>Anda belum login.</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Navbar />
        <div className="container mt-5 text-center">
          <h3>Memuat data akun...</h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      {/* Mini Account Navigation */}
      <div className="account-nav">
        <div className="account-nav-container">
          <button 
            className={`account-nav-item ${activeTab === 'data-akun' ? 'active' : ''}`}
            onClick={() => setActiveTab('data-akun')}
          >
            DATA AKUN
          </button>
          <button 
            className={`account-nav-item ${activeTab === 'status-pesanan' ? 'active' : ''}`}
            onClick={() => setActiveTab('status-pesanan')}
          >
            STATUS PESANAN
          </button>
        </div>
      </div>

      <div className="container account-container">
        {/* Tab DATA AKUN */}
        {activeTab === 'data-akun' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Data Akun</h2>
              {!isEditing ? (
                <button 
                  className="btn btn-primary"
                  onClick={handleEdit}
                  disabled={!user}
                >
                  Edit Data
                </button>
              ) : (
                <div>
                  <button 
                    className="btn btn-success me-2"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
            
            {!user ? (
              <div className="text-center">
                <p>Memuat data akun...</p>
              </div>
            ) : (
              <div className="account-info">
                {!isEditing ? (
                  <table className="table table-bordered mt-4">
                    <tbody>
                      <tr><th>Nama</th><td>{user.nama_pembeli || '-'}</td></tr>
                      <tr><th>Username</th><td>{username}</td></tr>
                      <tr><th>Email</th><td>{user.email || '-'}</td></tr>
                      <tr><th>No. HP</th><td>{user.no_hp || '-'}</td></tr>
                      <tr><th>Negara</th><td>{user.negara_pembeli || '-'}</td></tr>
                      <tr><th>Provinsi</th><td>{user.provinsi_pembeli || '-'}</td></tr>
                      <tr><th>Kota</th><td>{user.kota_pembeli || '-'}</td></tr>
                      <tr><th>Alamat</th><td>{user.alamat1_pembeli || '-'}</td></tr>
                      <tr><th>Kode Pos</th><td>{user.kode_pos || '-'}</td></tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="edit-form">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Nama Lengkap <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="nama_pembeli"
                            value={editedUser.nama_pembeli || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            value={username}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Email <span className="text-danger">*</span></label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={editedUser.email || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">No. HP</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="no_hp"
                            value={editedUser.no_hp || ''}
                            onChange={handleInputChange}
                            pattern="[0-9]*"
                            title="Hanya angka yang diperbolehkan"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Negara</label>
                          <input
                            type="text"
                            className="form-control"
                            name="negara_pembeli"
                            value={editedUser.negara_pembeli || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Provinsi</label>
                          <input
                            type="text"
                            className="form-control"
                            name="provinsi_pembeli"
                            value={editedUser.provinsi_pembeli || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Kota</label>
                          <input
                            type="text"
                            className="form-control"
                            name="kota_pembeli"
                            value={editedUser.kota_pembeli || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Kode Pos</label>
                          <input
                            type="text"
                            className="form-control"
                            name="kode_pos"
                            value={editedUser.kode_pos || ''}
                            onChange={handleInputChange}
                            pattern="[0-9]*"
                            title="Hanya angka yang diperbolehkan"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Alamat</label>
                      <textarea
                        className="form-control"
                        name="alamat1_pembeli"
                        value={editedUser.alamat1_pembeli || ''}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab STATUS PESANAN */}
        {activeTab === 'status-pesanan' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Status Pesanan</h2>
              <button 
                className="btn btn-primary"
                onClick={fetchUserOrders}
                disabled={isLoading}
              >
                {isLoading ? 'Memuat...' : '🔄 Refresh'}
              </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="orders-controls mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="search-box">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cari pesanan berdasarkan ID atau nama produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button 
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setSearchTerm('')}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Semua Status ({orderCounts.all})</option>
                    <option value="pending">Pending ({orderCounts.pending})</option>
                    <option value="processing">Diproses ({orderCounts.processing})</option>
                    <option value="shipped">Dikirim ({orderCounts.shipped})</option>
                    <option value="delivered">Selesai ({orderCounts.delivered})</option>
                    <option value="cancelled">Dibatalkan ({orderCounts.cancelled})</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select"
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="highest">Harga Tertinggi</option>
                    <option value="lowest">Harga Terendah</option>
                  </select>
                </div>
              </div>
              
              {/* Active filters indicator */}
              {(searchTerm || statusFilter !== 'all' || sortBy !== 'newest') && (
                <div className="active-filters mt-2">
                  <small className="text-muted">
                    <i className="fas fa-filter"></i> Filter aktif: 
                    {searchTerm && <span className="badge bg-primary ms-1">Pencarian: "{searchTerm}"</span>}
                    {statusFilter !== 'all' && <span className="badge bg-info ms-1">Status: {statusFilter}</span>}
                    {sortBy !== 'newest' && <span className="badge bg-secondary ms-1">Urutan: {sortBy}</span>}
                    <button 
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setSortBy('newest');
                      }}
                    >
                      Reset Filter
                    </button>
                  </small>
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Memuat data pesanan...</p>
              </div>
            ) : filteredOrders.length === 0 && orders.length > 0 ? (
              <div className="text-center py-5">
                <div className="empty-orders">
                  <h4>🔍 Tidak ada pesanan yang sesuai</h4>
                  <p>Coba ubah filter atau kata kunci pencarian</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Hapus Filter
                  </button>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <div className="empty-orders">
                  <h4>📦 Belum Ada Pesanan</h4>
                  <p>Anda belum melakukan pemesanan apapun.</p>
                  <button 
                    className="btn btn-success"
                    onClick={() => window.location.href = '/shop'}
                  >
                    Mulai Belanja
                  </button>
                </div>
              </div>
            ) : (
              <div className="orders-list">
                <div className="orders-summary mb-4">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="summary-card">
                        <h6>Total Pesanan</h6>
                        <span className="summary-number">{sortedFilteredOrders.length}</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="summary-card">
                        <h6>Sedang Diproses</h6>
                        <span className="summary-number text-warning">
                          {sortedFilteredOrders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="summary-card">
                        <h6>Dalam Pengiriman</h6>
                        <span className="summary-number text-info">
                          {sortedFilteredOrders.filter(o => o.status === 'shipped').length}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="summary-card">
                        <h6>Selesai</h6>
                        <span className="summary-number text-success">
                          {sortedFilteredOrders.filter(o => o.status === 'delivered').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {sortedFilteredOrders.map(order => (
                  <div key={order.order_id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">
                        <strong>Order ID:</strong> {order.order_id}
                      </div>
                      <div className="order-date">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div className="order-body">
                      <div className="order-items">
                        <h5>Item yang dibeli:</h5>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={index} className="item-row">
                              <span className="item-name">{item.nama_barang || 'Produk'}</span>
                              <span className="item-quantity">x{item.quantity || 1}</span>
                              <span className="item-price">{formatRupiah(item.price || 0)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="item-row">
                            <span className="item-name">Data item tidak tersedia</span>
                            <span className="item-quantity">-</span>
                            <span className="item-price">-</span>
                          </div>
                        )}
                      </div>
                      <div className="order-footer">
                        <div className="order-total">
                          <strong>Total: {formatRupiah(order.total_amount || 0)}</strong>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge status-${order.status}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="order-actions mt-3">
                        {order.status === 'pending' && (
                          <small className="text-muted">
                            ⏳ Pesanan Anda sedang diproses oleh penjual
                          </small>
                        )}
                        {order.status === 'pengiriman' && (
                          <small className="text-info">
                            🚚 Pesanan Anda sedang dalam perjalanan
                          </small>
                        )}
                        {order.status === 'selesai' && (
                          <small className="text-success">
                            ✅ Pesanan telah selesai dan diterima
                          </small>
                        )}
                        {order.status === 'dibatalkan' && (
                          <small className="text-danger">
                            ❌ Pesanan telah dibatalkan
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
