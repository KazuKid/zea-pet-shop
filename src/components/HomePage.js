import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Navbar from "./Navbar";

const HomePage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  // Mapping background class secara manual sesuai urutan kategori
  const bgClass = [
    'category-background-1',
    'category-background-2',
    'category-background-3',
    'category-background-4',
    'category-background-5',
    'category-background-6',
  ];

  return (
    <div className="homepage">
      <Navbar /> {/* Gunakan Navbar di sini */}
      
      {/* Hero Section */}
      <main>
        <section className="hero">
          <div className="hero-text">
            <h1>Sayangi Hewan Peliharaan Anda</h1>
            <p>Dapatkan barang-barang untuk hewan peliharaan Anda di sini, jangan lewatkan promo-promo menarik lainnya</p>
          </div>
          <div className="hero-image">
            <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src="kucing12.jpg" className="d-block w-100" alt="Gambar 1" />
                </div>
                <div className="carousel-item">
                  <img src="kucing13.jpg" className="d-block w-100" alt="Gambar 2" />
                </div>
                <div className="carousel-item">
                  <img src="catfood2.jpg" className="d-block w-100" alt="Gambar 3" />
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories">
          <h2>OUR CATEGORY</h2>
          <div className="category-list">
            {categories.map((cat, idx) => (
              <Link
                to={`/shop?kategori=${cat.id_kategori}`}
                className="category-item"
                key={cat.id_kategori}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className={bgClass[idx % bgClass.length]}></div>
                <p>{cat.nama_kategori}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p>Copyright © 2025 Pet Shop Zea</p>
          <p className="footer-cs">CS WA : +6285326354313</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;