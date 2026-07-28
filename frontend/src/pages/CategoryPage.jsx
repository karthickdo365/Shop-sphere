import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import ProductGrid from '../components/ProductGrid.jsx';
import { SlidersHorizontal, X } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({});
  const [availableFilters, setAvailableFilters] = useState({ sizes: [], colors: [] });

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['BLACK', 'BLUE', 'BEIGE', 'BURGUNDY', 'DARK GREY', 'DARK BEIGE', 'NAVY', 'PEACOCK', 'RED', 'SEA FOAM', 'ONION PINK', 'LIGHT PISTA', 'AIRFORCE BLUE', 'DARK COFFEE', 'GREY', 'BOTTLE GREEN', 'BROWN', 'GREEN'];

  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ category: slug, sort, page, limit: 12 });
    if (selectedSize) params.set('size', selectedSize);
    if (selectedColor) params.set('color', selectedColor);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    api.get(`/products?${params.toString()}`)
      .then((r) => {
        setProducts(r.data.data);
        setPagination(r.data.pagination);
        setAvailableFilters(r.data.filters || { sizes: [], colors: [] });
      })
      .finally(() => setLoading(false));

    api.get(`/categories/${slug}`).then((r) => setCategory(r.data.data)).catch(() => setCategory(null));
  }, [slug, selectedSize, selectedColor, minPrice, maxPrice, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const resetFilters = () => setSearchParams({});

  const FiltersPanel = () => (
    <div className="filters-panel">
      <div className="filters-header">
        <h3>Filters</h3>
        <button className="reset-btn" onClick={resetFilters}>Reset Filters</button>
      </div>

      <div className="filter-section">
        <h4>Price</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="form-input"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>Size</h4>
        <div className="size-buttons">
          {sizes.map((s) => (
            <button
              key={s}
              className={`size-btn ${selectedSize === s ? 'active' : ''}`}
              onClick={() => updateParam('size', selectedSize === s ? '' : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Color</h4>
        <div className="color-buttons">
          {colors.map((c) => (
            <button
              key={c}
              className={`color-btn ${selectedColor === c ? 'active' : ''}`}
              onClick={() => updateParam('color', selectedColor === c ? '' : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="category-page container">
      <h1 className="category-title">{category?.name || slug.replace(/-/g, ' ').toUpperCase()}</h1>

      <div className="category-layout">
        <aside className={`filters-sidebar ${filtersOpen ? 'open' : ''}`}>
          <FiltersPanel />
        </aside>

        <div className="products-area">
          <div className="products-toolbar">
            <button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <span className="result-count">
              {pagination.total || 0} products
            </span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <ProductGrid products={products} loading={loading} />

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => updateParam('page', String(page - 1))}
              >
                &laquo; Prev
              </button>
              <span>Page {page} of {pagination.totalPages}</span>
              <button
                disabled={!pagination.hasNext}
                onClick={() => updateParam('page', String(page + 1))}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </div>
      </div>

      {filtersOpen && <div className="filters-overlay" onClick={() => setFiltersOpen(false)} />}

      <style>{`
        .category-page { padding: 24px 16px; }
        .category-title {
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .category-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
        }
        .filters-sidebar {
          background: #fff;
          height: fit-content;
          position: sticky;
          top: 80px;
        }
        .filters-panel {
          padding: 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }
        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .filters-header h3 { font-size: 16px; font-weight: 600; }
        .reset-btn {
          color: var(--color-accent);
          font-size: 12px;
          font-weight: 500;
        }
        .filter-section { margin-bottom: 20px; }
        .filter-section h4 {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text);
        }
        .price-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .price-inputs input {
          padding: 6px 10px;
          font-size: 13px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          width: 100%;
        }
        .size-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .size-btn {
          padding: 6px 12px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: #fff;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .size-btn:hover { border-color: var(--color-accent); }
        .size-btn.active {
          background: var(--color-text);
          color: #fff;
          border-color: var(--color-text);
        }
        .color-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .color-btn {
          padding: 4px 10px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: #fff;
          font-size: 11px;
          transition: all 0.2s;
        }
        .color-btn:hover { border-color: var(--color-accent); }
        .color-btn.active {
          background: var(--color-accent);
          color: #fff;
          border-color: var(--color-accent);
        }
        .products-area { min-height: 400px; }
        .products-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border);
        }
        .filter-toggle {
          display: none;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        .result-count {
          font-size: 13px;
          color: var(--color-text-light);
        }
        .sort-select {
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: #fff;
          font-size: 13px;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 32px;
          padding: 16px 0;
        }
        .pagination button {
          padding: 8px 16px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: #fff;
          font-size: 13px;
          transition: all 0.2s;
        }
        .pagination button:hover:not(:disabled) {
          background: var(--color-accent);
          color: #fff;
          border-color: var(--color-accent);
        }
        .pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pagination span { font-size: 14px; color: var(--color-text-light); }
        .filters-overlay {
          display: none;
        }
        @media (max-width: 900px) {
          .category-layout { grid-template-columns: 1fr; }
          .filters-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px;
            background: #fff;
            z-index: 1000;
            padding: 20px;
            overflow-y: auto;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .filters-sidebar.open {
            transform: translateX(0);
          }
          .filter-toggle { display: flex; }
          .filters-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }
        }
      `}</style>
    </div>
  );
}
