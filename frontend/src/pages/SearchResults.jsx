import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import ProductGrid from '../components/ProductGrid.jsx';

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setResults([]); return; }
    setLoading(true);
    api.get(`/products?q=${encodeURIComponent(q)}&limit=24`)
      .then((r) => setResults(r.data.data))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container search-page">
      <h1 className="page-title">Search Results</h1>
      <p className="search-meta">Showing results for: <strong>"{q}"</strong></p>
      <ProductGrid products={results} loading={loading} />
      <style>{`
        .search-page { padding: 24px 16px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .search-meta { color: var(--color-text-light); margin-bottom: 24px; font-size: 14px; }
      `}</style>
    </div>
  );
}
