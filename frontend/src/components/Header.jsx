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

  const goToProduct = (slug) => {
    setShowSearchDropdown(false);
    setSearch('');
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
                    <Link key={c.id} to={`/category/${c.slug}`} className="cat-mega-item">
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
              <Link key={c.id} to={`/category/${c.slug}`} onClick={() => setMenuOpen(false)} style={{ paddingLeft: '12px' }}>
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
          transition: box-shadow 0.2s ease;
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
        .logo-container {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-size: 22px;
          font-weight: 800;
          color: var(--color-text);
          letter-spacing: 1px;
        }
        .logo-accent {
          color: var(--color-accent);
        }
        .navigation {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .navigation > a {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          color: var(--color-text);
          position: relative;
          padding: 6px 0;
        }
        .navigation > a:hover {
          color: var(--color-accent);
        }
        .navigation a.offer-link {
          color: var(--color-accent);
        }
        .navigation a.admin-link {
          color: #fff;
          background: var(--color-accent);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 11px;
        }
        .navigation a.admin-link:hover {
          background: var(--color-accent-dark);
          color: #fff;
        }
        .navigation > a:hover::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-accent);
        }
        .cat-nav-item {
          position: relative;
        }
        .cat-trigger {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          color: var(--color-text);
          padding: 6px 0;
        }
        .cat-trigger:hover { color: var(--color-accent); }
        .cat-mega-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          padding: 16px;
          min-width: 520px;
          z-index: 200;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .cat-mega-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .cat-mega-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text);
          transition: background 0.15s;
        }
        .cat-mega-item:hover {
          background: var(--color-light-gray);
          color: var(--color-accent);
        }
        .cat-mega-item img {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          object-fit: cover;
          background: var(--color-light-gray);
        }
        .search-wrap {
          flex: 1;
          max-width: 460px;
          position: relative;
        }
        .search-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-light-gray);
          padding: 8px 14px;
          border-radius: 20px;
          border: 1px solid transparent;
          transition: border 0.2s, background 0.2s;
        }
        .search-container:focus-within {
          background: #fff;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(244, 51, 54, 0.1);
        }
        .search-container input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          min-width: 0;
        }
        .search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          color: #999;
          border-radius: 50%;
        }
        .search-clear:hover { background: rgba(0,0,0,0.05); color: var(--color-text); }
        .search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: 200;
          max-height: 480px;
          display: flex;
          flex-direction: column;
        }
        .search-loading, .search-empty {
          padding: 24px 16px;
          text-align: center;
          color: var(--color-text-light);
          font-size: 13px;
        }
        .search-results-list {
          overflow-y: auto;
          flex: 1;
        }
        .search-result-item {
          display: grid;
          grid-template-columns: 44px 1fr auto;
          gap: 12px;
          align-items: center;
          width: 100%;
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid var(--color-border);
          transition: background 0.15s;
        }
        .search-result-item:hover {
          background: var(--color-light-gray);
        }
        .search-result-item img {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          background: var(--color-light-gray);
        }
        .sri-name {
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sri-cat {
          font-size: 11px;
          color: var(--color-text-light);
          margin-top: 2px;
        }
        .sri-price {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-accent);
          white-space: nowrap;
        }
        .search-view-all {
          padding: 12px 16px;
          background: var(--color-light-gray);
          font-size: 13px;
          font-weight: 600;
          color: var(--color-accent);
          text-align: center;
          transition: background 0.15s;
        }
        .search-view-all:hover { background: rgba(244, 51, 54, 0.08); }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text);
          padding: 6px;
          border-radius: 50%;
          transition: color 0.2s, background 0.2s;
        }
        .icon-wrapper:hover {
          color: var(--color-accent);
          background: rgba(244, 51, 54, 0.08);
        }
        .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--color-accent);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hamburger { display: none; }
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 16px;
          background: #fff;
          border-top: 1px solid var(--color-border);
          gap: 12px;
        }
        .mobile-menu a {
          font-weight: 600;
          font-size: 14px;
          padding: 8px 0;
        }
        .mobile-cat-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 0;
          border-top: 1px dashed var(--color-border);
          border-bottom: 1px dashed var(--color-border);
        }
        .mobile-cat-section strong {
          font-size: 11px;
          letter-spacing: 1px;
          color: var(--color-text-light);
          padding: 4px 0;
        }
        .btn-mobile-logout {
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 0;
          color: var(--color-accent);
        }
        @media (max-width: 900px) {
          .navigation { display: none; }
          .search-wrap { max-width: none; }
          .hamburger { display: flex; }
        }
        @media (max-width: 600px) {
          .header-inner { gap: 12px; }
          .search-wrap { display: none; }
          .logo-text { font-size: 18px; }
          .mobile-menu { display: flex; }
        }
      `}</style>
    </header>
  );
}
