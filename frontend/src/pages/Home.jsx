import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import ProductGrid from '../components/ProductGrid.jsx';
import { formatPrice, getFirstImage } from '../utils/helpers.js';
import BannerCarousel from '../components/BannerCarousel.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <Link to={`/category/${cat.slug}`} key={cat.id} className="category-card">
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

      {/* Trust Marquee */}
<section className="trust-marquee">
  <div className="marquee-track">

    {[
      "30-Day Easy Returns",
      "Premium Quality Products",
      "100% Secure Payments",
      "Fast Shipping Across India",
      "24/7 Customer Support",
      "Best Price Guarantee",

      // Duplicate for seamless scrolling
      "30-Day Easy Returns",
      "Premium Quality Products",
      "100% Secure Payments",
      "Fast Shipping Across India",
      "24/7 Customer Support",
      "Best Price Guarantee",
    ].map((text, index) => (
      <div className="trust-item" key={index}>
        <span className="trust-icon">✔</span>
        <span>{text}</span>
      </div>
    ))}

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
  background: linear-gradient(
    90deg,
    rgba(0,0,0,.75) 0%,
    rgba(0,0,0,.4) 60%,
    transparent 100%
  );
  padding: 40px 0;
}

.hero-content{
  max-width:560px;
}

.hero-content h1{
  font-size:48px;
  font-weight:800;
  line-height:1.1;
  margin-bottom:16px;
  letter-spacing:1px;
}

.hero-content p{
  font-size:16px;
  margin-bottom:24px;
  opacity:.9;
}

.section{
  padding:48px 16px;
}

/* CATEGORY */

.category-grid{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:16px;
}

.category-card{
  position:relative;
  aspect-ratio:1;
  overflow:hidden;
  border-radius:12px;
  background:#f5f5f5;
}

.category-card img{
  width:100%;
  height:100%;
  object-fit:cover;
  transition:.4s;
}

.category-card:hover img{
  transform:scale(1.08);
}

.category-card p{
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  padding:30px 12px 12px;
  color:#fff;
  text-align:center;
  font-size:13px;
  font-weight:600;
  text-transform:uppercase;
  background:linear-gradient(transparent,rgba(0,0,0,.85));
}

/* PROMO */

.promo-strip{
  background:#f43336;
  color:#fff;
  padding:32px 0;
}

.promo-content{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  flex-wrap:wrap;
}

.promo-content h3{
  font-size:26px;
  margin-bottom:5px;
}

.promo-content .btn-outline{
  background:transparent;
  color:#fff;
  border:1px solid #fff;
}

.promo-content .btn-outline:hover{
  background:#fff;
  color:#f43336;
}

/* ===========================
   TRUST MARQUEE
=========================== */

.trust-marquee{
  width:100%;
  overflow:hidden;
  background:#ffffff;
  border-top:1px solid #e5e5e5;
  border-bottom:1px solid #e5e5e5;
  padding:18px 0;
  margin-top:40px;
}

.marquee-track{
  display:flex;
  align-items:center;
  width:max-content;
  animation:marquee 20s linear infinite;
}

.trust-marquee:hover .marquee-track{
  animation-play-state:paused;
}

.trust-item{
  display:flex;
  align-items:center;
  gap:12px;
  padding:0 45px;
  white-space:nowrap;
  flex-shrink:0;
  font-size:16px;
  font-weight:600;
  color:#222;
}

.trust-icon{
  color:#f43336;
  font-size:20px;
}

@keyframes marquee{

  0%{
    transform:translateX(0);
  }

  100%{
    transform:translateX(-50%);
  }

}

/* LOADER */

.loader{
  display:flex;
  justify-content:center;
  align-items:center;
  width:100%;
  padding:40px;
}

/* RESPONSIVE */

@media (max-width:900px){

  .category-grid{
    grid-template-columns:repeat(3,1fr);
  }

  .hero-content h1{
    font-size:36px;
  }

  .hero-section{
    height:320px;
  }

  .promo-content{
    justify-content:center;
    text-align:center;
  }

}

@media (max-width:480px){

  .category-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .hero-content h1{
    font-size:28px;
  }

  .promo-content h3{
    font-size:20px;
  }

  .trust-item{
    padding:0 25px;
    font-size:14px;
  }

}
      `}</style>
    </div>
  );
}
