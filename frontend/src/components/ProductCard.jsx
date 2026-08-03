import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice, getFirstImage, calculateDiscountPercent } from '../utils/helpers.js';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();

  const inWishlist = isInWishlist(product.id);
  const price = product.discountPrice ?? product.basePrice;
  const mrp = product.discountPrice ? product.basePrice : null;
  const discount = calculateDiscountPercent(mrp, price);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    const r = await toggleWishlist(product.id);
    toast.success(r.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    const firstVariant = product.variants?.[0];
    if (!firstVariant) return;
    const r = await addItem({
      productId: product.id,
      size: firstVariant.size,
      color: firstVariant.color,
      quantity: 1,
      variantId: firstVariant.id,
    });
    if (r.requiresAuth) {
      toast.error('Please login to add to cart');
    } else {
      toast.success('Added to cart!');
    }
  };

  return (
    <Link to={`/product/${product.slug || product.id}`} className="product-card">
      <div className="product-image-container">
        <img src={getFirstImage(product)} alt={product.name} loading="lazy" />
        {product.bundleAvailable && (
          <div className="bundle-tag">{product.bundleLabel || 'Bundle Available'}</div>
        )}
        {discount > 0 && <div className="discount-tag">{discount}% OFF</div>}
        <button
          className={`wishlist-toggle ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} fill={inWishlist ? '#F43336' : 'none'} color={inWishlist ? '#F43336' : '#2E2E2E'} />
        </button>
        <button className="quick-add-btn" onClick={handleQuickAdd} aria-label="Quick add to cart">
          <ShoppingBag size={16} /> Add
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="price-row">
          <p className="price">{formatPrice(price)}</p>
          {mrp && <p className="mrp">{formatPrice(mrp)}</p>}
        </div>
        {product.rating > 0 && (
          <div className="rating-row">
            <span className="stars">{'\u2605'.repeat(Math.round(product.rating))}</span>
            <span className="rating-text">{product.rating.toFixed(1)} ({product.numReviews})</span>
          </div>
        )}
      </div>

      <style>{`
        .product-card {
          display: block;
          background: #fff;
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1px solid var(--color-border);
          position: relative;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .product-card:hover .quick-add-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .product-image-container {
          position: relative;
          aspect-ratio: 1;
          background: var(--color-light-gray);
          overflow: hidden;
        }
        .product-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .product-card:hover .product-image-container img {
          transform: scale(1.05);
        }
        .bundle-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(46, 46, 46, 0.9);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.3px;
        }
        .discount-tag {
          position: absolute;
          top: 8px;
          right: 50px;
          background: var(--color-accent);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .wishlist-toggle {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s;
        }
        .wishlist-toggle:hover { transform: scale(1.1); }
        .quick-add-btn {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: var(--color-accent);
          color: #fff;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .quick-add-btn:hover {
          background: var(--color-accent-dark);
        }
        .product-info {
          padding: 12px;
        }
        .product-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 36px;
          margin-bottom: 6px;
        }
        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .price {
          color: var(--color-accent);
          font-weight: 700;
          font-size: 14px;
          margin: 0;
        }
        .mrp {
          color: #999;
          text-decoration: line-through;
          font-size: 12px;
          margin: 0;
        }
        .rating-row {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          font-size: 11px;
          color: #666;
        }
        .stars { color: #f59e0b; }
      `}</style>
    </Link>
  );
}