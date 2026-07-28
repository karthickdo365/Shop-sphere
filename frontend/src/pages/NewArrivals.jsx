import { useEffect, useState } from 'react';
import api from '../utils/api.js';
import ProductGrid from '../components/ProductGrid.jsx';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?newArrival=true&limit=24')
      .then((r) => setProducts(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container arrivals-page">
      <h1 className="page-title">New Arrivals</h1>
      <p className="page-subtitle">Fresh drops just for you</p>
      <ProductGrid products={products} loading={loading} />
      <style>{`
        .arrivals-page { padding: 24px 16px; }
        .page-title { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 8px; }
        .page-subtitle { text-align: center; color: var(--color-text-light); margin-bottom: 32px; }
      `}</style>
    </div>
  );
}
