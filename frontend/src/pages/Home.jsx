import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import ProductGrid from '../components/ProductGrid.jsx';
import { formatPrice, getFirstImage } from '../utils/helpers.js';
import BannerCarousel from '../components/BannerCarousel.jsx';
  import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const { user } = useAuth();

const handleCategoryClick = (e, slug) => {
  if (!user) {
    e.preventDefault();
    toast.error("Please login first");
    navigate("/login");
  }
};

  useEffect(() => {
    Promise.all([
      api.get('/categories').catch(() => ({ data: { data: [] } })),
      api.get('/products/featured').catch(() => ({ data: { data: [] } })),
      api.get('/products/new-arrivals').catch(() => ({ data: { data: [] } })),
      api.get('/banners').catch(() => ({ data: { data: [] } })),
    ]).then(([c, f, n, b]) => {
      setCategories(c.data.data);
      setFeatured(f.data.data);
      setNewArrivals(n.data.data);
      setBanners(b.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="home">
      {/* Banner Carousel (admin-managed) */}
      {banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <section className="hero-section">
          <div className="hero-overlay">
            <div className="container hero-content">
              <h1>EVERYTHING YOU LOVE.<br/>DELIVERED.</h1>
              <p>Electronics, Fashion, Home, Toys, Books & more. Millions of products, best prices, easy returns.</p>
              <Link to="/category/mobiles" className="btn btn-primary btn-lg">
                SHOP NOW
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Shop by Category */}
      <section className="container section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : (
            categories.map((cat) => (
              <Link
  to={`/category/${cat.slug}`}
  key={cat.id}
  className="category-card"
  onClick={(e) => handleCategoryClick(e, cat.slug)}
>
                <img src={cat.image || 'https://via.placeholder.com/400x400?text=' + cat.name} alt={cat.name} />
                <p>{cat.name}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Featured Products</h2>
          <ProductGrid products={featured} loading={loading} />
          <div className="text-center mt-3">
            <Link to="/new-arrivals" className="btn btn-outline">View All</Link>
          </div>
        </section>
      )}

      {/* Promo Strip */}
      <section className="promo-strip">
        <div className="container promo-content">
          <div>
            <h3>Bundle & Save</h3>
            <p>Buy 2 or more and unlock exclusive bundle discounts</p>
          </div>
          <Link to="/offers" className="btn btn-outline">EXPLORE OFFERS</Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container section">
          <h2 className="section-title">New Arrivals</h2>
          <ProductGrid products={newArrivals} loading={loading} />
        </section>
      )}

      {/* Trust Badges */}
      <section className="container trust-badges">
        <div className="trust-item">
          <div className="trust-icon">&#8634;</div>
          <h4>30-Day Returns</h4>
          <p>Easy and hassle-free returns</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">&#9733;</div>
          <h4>Premium Quality</h4>
          <p>Crafted from finest fabrics</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">&#9986;</div>
          <h4>Secure Payments</h4>
          <p>100% secure checkout</p>
        </div>
        <div className="trust-item">
          <div className="trust-icon">&#9992;</div>
          <h4>Fast Shipping</h4>
          <p>Dispatched within 24 hours</p>
        </div>
      </section>

      <style>{`
        .hero-section {
          position: relative;
          height: 420px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 50%, #4a4a4a 100%);
          background-image: url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          color: #fff;
        }
        .hero-overlay {
          width: 100%;
          background: linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
          padding: 40px 0;
        }
        .hero-content { max-width: 560px; }
        .hero-content h1 {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 16px;
          letter-spacing: 1px;
        }
        .hero-content p {
          font-size: 16px;
          margin-bottom: 24px;
          opacity: 0.9;
        }
        .section { padding: 48px 16px; }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }
        .category-card {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: var(--radius-md);
          background: var(--color-light-gray);
        }
        .category-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .category-card:hover img { transform: scale(1.08); }
        .category-card p {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.85));
          color: #fff;
          padding: 30px 12px 12px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .promo-strip {
          background: var(--color-accent);
          color: #fff;
          padding: 32px 0;
        }
        .promo-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .promo-content h3 {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .promo-content p { opacity: 0.95; }
        .promo-content .btn-outline {
          background: transparent;
          color: #fff;
          border-color: #fff;
        }
        .promo-content .btn-outline:hover {
          background: #fff;
          color: var(--color-accent);
        }
        .trust-badges {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          padding: 40px 16px;
          border-top: 1px solid var(--color-border);
          margin-top: 40px;
        }
        .trust-item {
          text-align: center;
        }
        .trust-icon {
          font-size: 32px;
          color: var(--color-accent);
          margin-bottom: 8px;
        }
        .trust-item h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .trust-item p {
          font-size: 12px;
          color: var(--color-text-light);
        }
        @media (max-width: 900px) {
          .category-grid { grid-template-columns: repeat(3, 1fr); }
          .trust-badges { grid-template-columns: repeat(2, 1fr); }
          .hero-content h1 { font-size: 36px; }
          .hero-section { height: 320px; }
        }
        @media (max-width: 480px) {
          .category-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-content h1 { font-size: 28px; }
          .promo-content h3 { font-size: 20px; }
        }
      `}</style>
    </div>
  );
}
