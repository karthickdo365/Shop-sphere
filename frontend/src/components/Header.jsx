import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { debounce, getFirstImage, formatPrice } from '../utils/helpers.js';
import api from '../utils/api.js';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catDropdown, setCatDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Live search: 1+ chars triggers dropdown
  const doLiveSearch = debounce(async (q) => {
    if (q.trim().length < 1) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    setSearchLoading(true);
    setShowSearchDropdown(true);
    try {
      const r = await api.get(`/products?q=${encodeURIComponent(q.trim())}&limit=8`);
      setSearchResults(r.data.data);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, 250);

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);
    doLiveSearch(v);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };
  const handleProtectedNavigation = (e, path) => {
  if (!user) {
    e.preventDefault();
    toast.error("Please login first");
    navigate("/login");
    return;
  }

  navigate(path);
};

 const goToProduct = (slug) => {
  if (!user) {
    toast.error("Please login first");
    navigate("/login");
    return;
  }

  setShowSearchDropdown(false);
  setSearch("");
  navigate(`/product/${slug}`);
};

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo-container">
          <span className="logo-text">Shop<span className="logo-accent">Sphere</span></span>
        </Link>

        {/* Nav (desktop) */}
        <nav className="navigation">
          <Link to="/">HOME</Link>

          {/* Categories dropdown */}
          <div
            className="cat-nav-item"
            onMouseEnter={() => setCatDropdown(true)}
            onMouseLeave={() => setCatDropdown(false)}
          >
            <button className="cat-trigger">
              CATEGORIES <ChevronDown size={14} />
            </button>
            {catDropdown && (
              <div className="cat-mega-menu">
                <div className="cat-mega-grid">
                  {categories.map((c) => (
                  <Link
  key={c.id}
  to={`/category/${c.slug}`}
  className="cat-mega-item"
  onClick={(e) => handleProtectedNavigation(e, `/category/${c.slug}`)}
>
                      {c.image && <img src={c.image} alt={c.name} />}
                      <span>{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/new-arrivals">NEW ARRIVALS</Link>
          <Link to="/offers" className="offer-link">OFFERS</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="admin-link">ADMIN</Link>
          )}
        </nav>

        {/* Search with live dropdown */}
        <div className="search-wrap" ref={searchRef}>
          <form className="search-container" onSubmit={handleSearch}>
            <Search size={18} color="#999" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={search}
              onChange={handleSearchChange}
              onFocus={() => search.length > 0 && setShowSearchDropdown(true)}
              autoComplete="off"
            />
            {search && (
              <button type="button" className="search-clear" onClick={() => { setSearch(''); setSearchResults([]); setShowSearchDropdown(false); }}>
                <X size={14} />
              </button>
            )}
          </form>

          {showSearchDropdown && (
            <div className="search-dropdown">
              {searchLoading ? (
                <div className="search-loading">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="search-empty">
                  {search.trim().length < 1
                    ? 'Type to search products...'
                    : `No products found for "${search}"`}
                </div>
              ) : (
                <>
                  <div className="search-results-list">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="search-result-item"
                        onClick={() => goToProduct(p.slug)}
                      >
                        <img src={getFirstImage(p)} alt={p.name} />
                        <div className="sri-info">
                          <p className="sri-name">{p.name}</p>
                          <p className="sri-cat">{p.category?.name}</p>
                        </div>
                        <p className="sri-price">{formatPrice(p.discountPrice ?? p.basePrice)}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="search-view-all"
                    onClick={() => {
                      setShowSearchDropdown(false);
                      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
                    }}
                  >
                    View all results for "{search}" &rarr;
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="header-actions">
          <Link to={user ? '/account' : '/login'} className="icon-wrapper" aria-label="Account">
            <User size={22} />
          </Link>
          <Link to="/wishlist" className="icon-wrapper" aria-label="Wishlist">
            <Heart size={22} />
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="icon-wrapper" aria-label="Cart">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
          {user && (
            <button onClick={logout} className="icon-wrapper logout-btn" aria-label="Logout" title="Logout">
              <X size={20} />
            </button>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link>
          <div className="mobile-cat-section">
            <strong>CATEGORIES</strong>
            {categories.map((c) => (
<Link
  key={c.id}
  to={`/category/${c.slug}`}
  style={{ paddingLeft: "12px" }}
  onClick={(e) => {
    setMenuOpen(false);
    handleProtectedNavigation(e, `/category/${c.slug}`);
  }}
>
  {c.name}
</Link>
            ))}
          </div>
          <Link to="/new-arrivals" onClick={() => setMenuOpen(false)}>NEW ARRIVALS</Link>
          <Link to="/offers" onClick={() => setMenuOpen(false)}>OFFERS</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-accent)' }}>ADMIN PANEL</Link>
          )}
          <Link to="/wishlist" onClick={() => setMenuOpen(false)}>WISHLIST</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>CART ({cartCount})</Link>
          <Link to={user ? '/account' : '/login'} onClick={() => setMenuOpen(false)}>
            {user ? 'MY ACCOUNT' : 'LOGIN'}
          </Link>
          {user && <button onClick={() => { logout(); setMenuOpen(false); }} className="btn-mobile-logout">LOGOUT</button>}
        </div>
      )}

      <style>{`
      .header {
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: .2s;
}

.header.scrolled {
  box-shadow: var(--shadow-md);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 16px;
}

/* =======================
   LOGO
======================= */

.logo-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
}

.logo-accent {
  color: var(--color-accent);
}

/* =======================
   NAVIGATION
======================= */

.navigation {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navigation>a {
  position: relative;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-text);
  padding: 8px 0;
}

.navigation>a:hover {
  color: var(--color-accent);
}

.navigation>a:hover::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: var(--color-accent);
}

.offer-link {
  color: var(--color-accent) !important;
}

.admin-link {
  background: var(--color-accent);
  color: #fff !important;
  padding: 7px 12px !important;
  border-radius: 6px;
  font-size: 12px !important;
}

/* =======================
   MEGA MENU
======================= */

.cat-nav-item {
  position: relative;
}

.cat-trigger {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-text);
  padding: 8px 0;
}

.cat-trigger:hover {
  color: var(--color-accent);
}

.cat-mega-menu {
  position: absolute;
  top: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%);
  width: 950px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eee;
  box-shadow: 0 20px 60px rgba(0,0,0,.12);
  padding: 24px;
  z-index: 999;
  animation: mega .18s ease;
}

@keyframes mega {

  from{
    opacity:0;
    transform:translateX(-50%) translateY(10px);
  }

  to{
    opacity:1;
    transform:translateX(-50%) translateY(0);
  }

}

.cat-mega-grid{

  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:20px;

}

.cat-mega-item{

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;

  padding:18px;

  border-radius:12px;

  transition:.25s;

  text-align:center;

}

.cat-mega-item:hover{

  background:#f8f8f8;
  transform:translateY(-4px);

}

.cat-mega-item img{

  width:75px;
  height:75px;

  border-radius:12px;

  object-fit:cover;

  margin-bottom:12px;

}

.cat-mega-item span{

  font-size:14px;
  font-weight:600;
  color:#333;

}

.cat-mega-item:hover span{

  color:var(--color-accent);

}

/* =======================
   SEARCH
======================= */

.search-wrap{

  flex:1;
  max-width:470px;
  position:relative;

}

.search-container{

  display:flex;
  align-items:center;
  gap:8px;

  background:#f6f6f6;

  padding:9px 14px;

  border-radius:25px;

  border:1px solid transparent;

}

.search-container:focus-within{

  background:#fff;
  border-color:var(--color-accent);

}

.search-container input{

  flex:1;
  border:none;
  outline:none;
  background:transparent;
  font-size:14px;

}

.search-clear{

  display:flex;
  align-items:center;
  justify-content:center;

  padding:4px;

}

.search-dropdown{

  position:absolute;

  top:calc(100% + 8px);

  left:0;
  right:0;

  background:#fff;

  border-radius:14px;

  border:1px solid #eee;

  box-shadow:0 18px 45px rgba(0,0,0,.12);

  overflow:hidden;

  z-index:500;

  max-height:450px;

}

.search-loading,
.search-empty{

  padding:24px;
  text-align:center;
  color:#888;

}

.search-results-list{

  overflow-y:auto;

}

.search-result-item{

  display:grid;

  grid-template-columns:45px 1fr auto;

  gap:12px;

  width:100%;

  padding:12px 16px;

  align-items:center;

  text-align:left;

  border-bottom:1px solid #f2f2f2;

}

.search-result-item:hover{

  background:#fafafa;

}

.search-result-item img{

  width:45px;
  height:45px;

  border-radius:8px;

  object-fit:cover;

}

.sri-name{

  font-size:13px;
  font-weight:600;

}

.sri-cat{

  font-size:11px;
  color:#999;

}

.sri-price{

  color:var(--color-accent);
  font-weight:700;

}

.search-view-all{

  padding:14px;

  background:#fafafa;

  font-weight:600;

  color:var(--color-accent);

}

/* =======================
   ACTIONS
======================= */

.header-actions{

  display:flex;
  align-items:center;
  gap:16px;

}

.icon-wrapper{

  position:relative;

  display:flex;
  align-items:center;
  justify-content:center;

  color:#333;

  padding:6px;

  border-radius:50%;

}

.icon-wrapper:hover{

  color:var(--color-accent);
  background:rgba(244,51,54,.08);

}

.badge{

  position:absolute;

  top:-2px;
  right:-2px;

  background:var(--color-accent);

  color:#fff;

  min-width:16px;
  height:16px;

  font-size:10px;
  font-weight:700;

  border-radius:20px;

  display:flex;
  align-items:center;
  justify-content:center;

}

.hamburger{

  display:none;

}

/* =======================
   MOBILE MENU
======================= */

.mobile-menu{

  display:none;

  flex-direction:column;

  gap:12px;

  padding:16px;

  background:#fff;

  border-top:1px solid #eee;

}

.mobile-menu a{

  font-size:14px;
  font-weight:600;

}

.mobile-cat-section{

  display:flex;

  flex-direction:column;

  gap:5px;

  padding:10px 0;

}

.btn-mobile-logout{

  text-align:left;

  color:var(--color-accent);

  font-weight:600;

}

/* =======================
   RESPONSIVE
======================= */

@media(max-width:1100px){

  .cat-mega-menu{

    width:700px;

  }

  .cat-mega-grid{

    grid-template-columns:repeat(3,1fr);

  }

}

@media(max-width:900px){

  .navigation{

    display:none;

  }

  .hamburger{

    display:flex;

  }

}

@media(max-width:600px){

  .search-wrap{

    display:none;

  }

  .mobile-menu{

    display:flex;

  }

  .logo-text{

    font-size:18px;

  }

}

@media(max-width:768px){

  .cat-mega-menu{

    width:95vw;

    left:0;

    transform:none;

  }

  .cat-mega-grid{

    grid-template-columns:repeat(2,1fr);

  }

}
      `}</style>
    </header>
  );
}
