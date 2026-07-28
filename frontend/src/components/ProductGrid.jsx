import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products found.</p>
        <style>{`
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--color-text-light);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 480px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
      `}</style>
    </>
  );
}
