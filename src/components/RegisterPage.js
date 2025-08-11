import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [form, setForm] = useState({
    nama: '', username: '', email: '', no_hp: '', alamat: '', negara: '', provinsi: '', kota: '', kode_pos: '', password: ''
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setForm({ nama: '', username: '', email: '', no_hp: '', alamat: '', negara: '', provinsi: '', kota: '', kode_pos: '', password: '' });
        navigate('/login');
      } else {
        setError(data.message || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan server');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="logo-circle">
          <img src="logopetshop2.png" alt="Zea Pet Shop Logo" />
        </div>
        <form onSubmit={handleSubmit}>
          <label>Nama:</label>
          <input type="text" name="nama" placeholder="Masukkan nama Anda" value={form.nama} onChange={handleChange} />
          <label>Username:</label>
          <input type="text" name="username" placeholder="Masukkan username Anda" value={form.username} onChange={handleChange} />
          <label>Password:</label>
          <input type="password" name="password" placeholder="Masukkan password Anda" value={form.password} onChange={handleChange} />
          <label>Email:</label>
          <input type="email" name="email" placeholder="Masukkan email Anda" value={form.email} onChange={handleChange} />
          <label>No. HP:</label>
          <input type="text" name="no_hp" placeholder="Masukkan nomor HP Anda" value={form.no_hp} onChange={handleChange} />
          <label>Alamat:</label>
          <input type="text" name="alamat" placeholder="Masukkan alamat Anda" value={form.alamat} onChange={handleChange} />
          <label>Negara:</label>
          <input type="text" name="negara" placeholder="Masukkan negara Anda" value={form.negara} onChange={handleChange} />
          <label>Provinsi:</label>
          <input type="text" name="provinsi" placeholder="Masukkan provinsi Anda" value={form.provinsi} onChange={handleChange} />
          <label>Kota:</label>
          <input type="text" name="kota" placeholder="Masukkan kota Anda" value={form.kota} onChange={handleChange} />
          <label>Kode Pos:</label>
          <input type="text" name="kode_pos" placeholder="Masukkan kode pos Anda" value={form.kode_pos} onChange={handleChange} />
          <button type="submit" className="register-button">Daftar</button>
        </form>
        <div style={{ marginTop: 12 }}>
          <a href="/login" style={{ color: '#4f8cff', textDecoration: 'underline', fontSize: 15 }}>Login</a>
        </div>
        {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
      </div>
    </div>
  );
};

export default RegisterPage;
