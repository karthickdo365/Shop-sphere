import { useEffect, useState } from 'react';
import api from '../utils/api.js';
import ProductGrid from '../components/ProductGrid.jsx';

export default function Offers() {
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?onOffer=true&limit=24'),
      api.get('/coupons'),
    ]).then(([p, c]) => {
      setProducts(p.data.data);
      setCoupons(c.data.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container offers-page">
      <h1 className="page-title">Offers & Deals</h1>
      <p className="page-subtitle">Save big on your favorite styles</p>

      {coupons.length > 0 && (
        <div className="coupons-strip">
          {coupons.map((c) => (
            <div key={c.id} className="coupon-card">
              <div className="coupon-code">{c.code}</div>
              <p>{c.description}</p>
              <span className="coupon-value">
                {c.type === 'PERCENT' ? `${c.value}% OFF` : `\u20B9${c.value} OFF`}
              </span>
              <small>Min order: &#8377;{c.minOrder}</small>
            </div>
          ))}
        </div>
      )}

      <ProductGrid products={products} loading={loading} />

      <style>{`
        .offers-page { padding: 24px 16px; }
        .page-title { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 8px; color: var(--color-accent); }
        .page-subtitle { text-align: center; color: var(--color-text-light); margin-bottom: 32px; }
        .coupons-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }
        .coupon-card {
          border: 2px dashed var(--color-accent);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: center;
          background: rgba(244, 51, 54, 0.03);
        }
        .coupon-code {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-accent);
          margin-bottom: 8px;
        }
        .coupon-card p { font-size: 13px; color: var(--color-text); margin-bottom: 8px; }
        .coupon-value { display: block; font-weight: 600; color: var(--color-success); margin-bottom: 4px; }
        .coupon-card small { font-size: 11px; color: var(--color-text-light); }
      `}</style>
    </div>
  );
}
