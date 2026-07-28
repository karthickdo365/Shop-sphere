import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Check, Star, Truck, RotateCcw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatPrice, calculateDiscountPercent, getFirstImage } from '../utils/helpers.js';
import ProductCard from '../components/ProductCard.jsx';
import SpecificationsView from '../components/SpecificationsView.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setSelectedSize('');
    setSelectedColor('');
    setQty(1);
    api.get(`/products/${slug}`)
      .then((r) => {
        const p = r.data.data;
        setProduct(p);
        setReviews(p.reviews || []);
        // Pre-select first variant
        if (p.variants?.length) {
          setSelectedSize(p.variants[0].size);
          setSelectedColor(p.variants[0].color);
        }
        // Fetch related
        api.get(`/products?category=${p.category?.slug}&limit=4`).then((rr) => {
          setRelated((rr.data.data || []).filter((x) => x.id !== p.id).slice(0, 4));
        });
      })
      .catch(() => {
        toast.error('Product not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!product) return null;

  const price = product.discountPrice ?? product.basePrice;
  const mrp = product.discountPrice ? product.basePrice : null;
  const discount = calculateDiscountPercent(mrp, price);
  const availableSizes = [...new Set(product.variants?.map((v) => v.size) || [])];
  const availableColors = [...new Set(product.variants?.map((v) => v.color) || [])];
  const inWishlist = isInWishlist(product.id);

  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    if (!selectedSize || !selectedColor) { toast.error('Please select size and color'); return; }
    if (selectedVariant?.stock === 0) { toast.error('Selected variant is out of stock'); return; }
    const r = await addItem({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity: qty,
      variantId: selectedVariant?.id,
    });
    if (r.requiresAuth) { toast.error('Please login'); return; }
    toast.success('Added to cart!');
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); navigate('/login'); return; }
    const r = await toggleWishlist(product.id);
    toast.success(r.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to write a review'); navigate('/login'); return; }
    if (!reviewForm.rating || !reviewForm.comment?.trim()) {
      toast.error('Please add a rating and comment');
      return;
    }
    setSubmittingReview(true);
    try {
      const r = await api.post(`/reviews/${product.id}`, {
        rating: Number(reviewForm.rating),
        title: reviewForm.title.trim() || null,
        comment: reviewForm.comment.trim(),
      });
      setReviews((prev) => [
        { ...r.data.data, user: { name: user.name } },
        ...prev,
      ]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="product-detail-page">
      <div className="container detail-grid">
        {/* Images */}
        <div className="image-section">
          <div className="main-image">
            <img src={product.images?.[activeImage]?.url || getFirstImage(product)} alt={product.name} />
            {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
            {product.bundleAvailable && <div className="bundle-badge">{product.bundleLabel || 'Bundle Available'}</div>}
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={img.id || i}
                  className={`thumb ${activeImage === i ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img.url} alt={img.alt || product.name} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="info-section">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> / <Link to={`/category/${product.category?.slug}`}>{product.category?.name}</Link> / <span>{product.name}</span>
          </nav>

          <h1 className="product-title">{product.name}</h1>

          <div className="rating-summary">
            {product.rating > 0 ? (
              <>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={16} fill={n <= Math.round(product.rating) ? '#f59e0b' : 'none'} color="#f59e0b" />
                  ))}
                </div>
                <span>{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
              </>
            ) : (
              <span className="no-reviews">No reviews yet</span>
            )}
          </div>

          <div className="price-block">
            <span className="current-price">{formatPrice(price)}</span>
            {mrp && <span className="mrp">{formatPrice(mrp)}</span>}
            {discount > 0 && <span className="save-tag">Save {formatPrice(mrp - price)}</span>}
          </div>

          {product.description && <p className="description">{product.description}</p>}

          {/* Size */}
          <div className="variant-section">
            <label>Select Size: <strong>{selectedSize}</strong></label>
            <div className="size-row">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  className={`size-pill ${selectedSize === s ? 'active' : ''}`}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="variant-section">
            <label>Select Color: <strong>{selectedColor}</strong></label>
            <div className="color-row">
              {availableColors.map((c) => (
                <button
                  key={c}
                  className={`color-pill ${selectedColor === c ? 'active' : ''}`}
                  onClick={() => setSelectedColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          {selectedVariant && (
            <p className={`stock-status ${selectedVariant.stock > 0 ? 'in-stock' : 'out-stock'}`}>
              {selectedVariant.stock > 0
                ? <><Check size={16} /> In Stock ({selectedVariant.stock} available)</>
                : 'Out of Stock'}
            </p>
          )}

          {/* Quantity */}
          <div className="qty-row">
            <label>Quantity:</label>
            <div className="qty-control">
              <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
            </div>
          </div>

          {/* Actions */}
          <div className="action-row">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={selectedVariant?.stock === 0}>
              <ShoppingBag size={18} /> ADD TO CART
            </button>
            <button className="btn btn-outline btn-lg" onClick={handleBuyNow} disabled={selectedVariant?.stock === 0}>
              BUY NOW
            </button>
            <button className={`wishlist-btn ${inWishlist ? 'active' : ''}`} onClick={handleWishlist} aria-label="Wishlist">
              <Heart size={22} fill={inWishlist ? '#F43336' : 'none'} color={inWishlist ? '#F43336' : '#2E2E2E'} />
            </button>
          </div>

          {/* Trust */}
          <div className="trust-list">
            <div><Truck size={18} /> Free shipping above &#8377;999</div>
            <div><RotateCcw size={18} /> 30-day easy returns</div>
            <div><Shield size={18} /> Secure payments</div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="container reviews-section">
        <h2 className="section-title">Customer Reviews ({reviews.length})</h2>

        {/* Review form */}
        <form className="review-form" onSubmit={submitReview}>
          <h3>Write a Review</h3>
          {!user && (
            <p className="login-hint">
              Please <Link to="/login">login</Link> to write a review.
            </p>
          )}
          <div className="review-rating-row">
            <label>Your Rating:</label>
            <div className="rating-stars-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="star-btn"
                  onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                  aria-label={`${n} stars`}
                >
                  <Star
                    size={24}
                    fill={n <= reviewForm.rating ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <input
              className="form-input"
              placeholder="Review title (optional)"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              disabled={!user}
            />
          </div>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Share your thoughts about this product..."
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              disabled={!user}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!user || submittingReview}>
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        {/* Existing reviews */}
        {reviews.length === 0 ? (
          <p className="no-reviews-text">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-head">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={14} fill={n <= r.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    ))}
                  </div>
                  <span className="reviewer">{r.user?.name || 'Anonymous'}</span>
                </div>
                {r.title && <h4>{r.title}</h4>}
                {r.comment && <p>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <section className="container specs-section">
          <SpecificationsView specifications={product.specifications} />
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="container related-section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <style>{`
        .product-detail-page { padding: 24px 0 48px; }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .image-section { position: sticky; top: 80px; align-self: start; }
        .main-image {
          position: relative;
          aspect-ratio: 1;
          background: var(--color-light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .main-image img { width: 100%; height: 100%; object-fit: cover; }
        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--color-accent);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 4px;
        }
        .bundle-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 4px;
        }
        .thumbnails {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
        }
        .thumb {
          flex-shrink: 0;
          width: 72px;
          height: 72px;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid transparent;
          background: var(--color-light-gray);
        }
        .thumb.active { border-color: var(--color-accent); }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .breadcrumb {
          font-size: 12px;
          color: var(--color-text-light);
          margin-bottom: 10px;
        }
        .breadcrumb a:hover { color: var(--color-accent); }
        .product-title {
          font-size: 24px;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 12px;
        }
        .rating-summary {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--color-text-light);
        }
        .stars { display: flex; gap: 2px; }
        .price-block {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--color-border);
        }
        .current-price {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-accent);
        }
        .mrp {
          font-size: 16px;
          color: #999;
          text-decoration: line-through;
        }
        .save-tag {
          background: rgba(22, 163, 74, 0.1);
          color: var(--color-success);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .description {
          font-size: 14px;
          color: var(--color-text-light);
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .variant-section { margin-bottom: 20px; }
        .variant-section label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .variant-section label strong { color: var(--color-accent); }
        .size-row, .color-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .size-pill, .color-pill {
          padding: 8px 16px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .size-pill:hover, .color-pill:hover { border-color: var(--color-accent); }
        .size-pill.active, .color-pill.active {
          background: var(--color-text);
          color: #fff;
          border-color: var(--color-text);
        }
        .stock-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          margin-bottom: 16px;
          font-weight: 500;
        }
        .stock-status.in-stock { color: var(--color-success); }
        .stock-status.out-stock { color: var(--color-accent); }
        .qty-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .qty-row label { font-size: 14px; }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 4px;
        }
        .qty-control button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background: var(--color-light-gray);
        }
        .qty-control button:hover { background: var(--color-accent); color: #fff; }
        .qty-control span { min-width: 24px; text-align: center; font-weight: 600; }
        .action-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .action-row .btn { flex: 1; }
        .wishlist-btn {
          width: 56px;
          height: 56px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          transition: all 0.2s;
        }
        .wishlist-btn:hover { border-color: var(--color-accent); }
        .trust-list {
          border-top: 1px solid var(--color-border);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .trust-list div {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--color-text-light);
        }
        .reviews-section, .related-section { padding: 48px 16px; }
        .specs-section { padding: 32px 16px; background: #fafafa; }
        .reviews-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .review-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 16px;
        }
        .review-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .reviewer { font-size: 12px; color: var(--color-text-light); }
        .review-card h4 { font-size: 14px; margin-bottom: 6px; }
        .review-card p { font-size: 13px; color: var(--color-text-light); line-height: 1.6; }

        /* Review form */
        .review-form {
          background: #fafafa;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 32px;
        }
        .review-form h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .login-hint {
          background: rgba(244, 51, 54, 0.06);
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 14px;
        }
        .login-hint a { color: var(--color-accent); font-weight: 500; }
        .review-rating-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .review-rating-row label { font-size: 14px; font-weight: 500; }
        .rating-stars-input { display: flex; gap: 4px; }
        .star-btn {
          padding: 2px;
          background: transparent;
          transition: transform 0.1s;
        }
        .star-btn:hover { transform: scale(1.15); }
        .review-form .form-group { margin-bottom: 12px; }
        .review-form .form-input, .review-form .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          background: #fff;
        }
        .review-form .form-textarea { resize: vertical; }
        .no-reviews-text {
          text-align: center;
          color: var(--color-text-light);
          padding: 24px;
          font-size: 14px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr; gap: 24px; }
          .image-section { position: static; }
          .reviews-list, .product-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .product-title { font-size: 20px; }
          .current-price { font-size: 22px; }
          .action-row { flex-direction: column; }
          .action-row .btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
