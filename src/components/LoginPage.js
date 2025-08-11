import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      // Periksa apakah login sukses dan ada token
      if (data.success && data.token) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("token", data.token); // Simpan token
        // Redirect ke homepage dengan state untuk trigger reload
        navigate("/", { state: { isLoggedIn: true } }); 
      } else {
        setError(data.message || "Username/password salah.");
      }
    } catch (err) {
      setError("Terjadi kesalahan server.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/">
          <img src="logopetshop2.png" alt="Zea Pet Shop Logo" className="logo" />
        </Link>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" placeholder="Masukkan username Anda" value={username} onChange={e => setUsername(e.target.value)} />
          <label>Password</label>
          <input type="password" placeholder="Masukkan password Anda" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="login-button">Masuk</button>
        </form>
        {error && <div style={{color:'red', marginTop:8}}>{error}</div>}
        <Link to="/register" className="register-link">Daftar</Link>
      </div>
    </div>
  );
};

export default LoginPage;
