import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice, getFirstImage } from '../utils/helpers.js';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, updateItem, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  if (!user) {
    return (
      <div className="container empty-cart">
        <h2>Please login to view your cart</h2>
        <Link to="/login" className="btn btn-primary">Login</Link>
        <style>{`.empty-cart { text-align: center; padding: 60px 20px; } .empty-cart h2 { margin-bottom: 20px; }`}</style>
      </div>
    );
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container empty-cart">
        <ShoppingBag size={64} color="#ccc" />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        <style>{`
          .empty-cart {
            text-align: center;
            padding: 60px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          .empty-cart h2 { margin: 12px 0 4px; }
          .empty-cart p { color: var(--color-text-light); margin-bottom: 12px; }
        `}</style>
      </div>
    );
  }

  const subtotal = cart.items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal - discount + shipping;

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const r = await api.post('/coupons/validate', { code: couponCode, subtotal });
      setDiscount(r.data.data.discount);
      setCouponMsg(`Coupon applied: -${formatPrice(r.data.data.discount)}`);
      toast.success('Coupon applied!');
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err.response?.data?.message || 'Invalid coupon');
      toast.error('Invalid coupon');
    }
  };

  const handleQty = async (item, newQty) => {
    if (newQty < 1) return;
    await updateItem(item.id, newQty);
  };

  const handleRemove = async (id) => {
    await removeItem(id);
    toast.success('Item removed');
  };

  return (
    <div className="container cart-page">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <Link to={`/product/${item.product.slug}`} className="cart-item-img">
                <img src={getFirstImage(item.product)} alt={item.product.name} />
              </Link>
              <div className="cart-item-info">
                <Link to={`/product/${item.product.slug}`} className="cart-item-name">{item.product.name}</Link>
                <p className="cart-item-variant">Size: {item.size} | Color: {item.color}</p>
                <p className="cart-item-price">{formatPrice(item.priceAtAdd)}</p>
              </div>
              <div className="cart-item-actions">
                <div className="qty-control">
                  <button onClick={() => handleQty(item, item.quantity - 1)}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQty(item, item.quantity + 1)}><Plus size={14} /></button>
                </div>
                <p className="cart-item-total">{formatPrice(item.priceAtAdd * item.quantity)}</p>
                <button className="remove-btn" onClick={() => handleRemove(item.id)} aria-label="Remove">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.items.length} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
          </div>
          {shipping > 0 && (
            <p className="shipping-note">Add {formatPrice(999 - subtotal)} more for FREE shipping</p>
          )}
          <div className="summary-divider" />
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="coupon-box">
            <input
              type="text"
              placeholder="Coupon code (try WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="form-input"
            />
            <button className="btn btn-outline btn-sm" onClick={applyCoupon}>Apply</button>
          </div>
          {couponMsg && <p className={`coupon-msg ${discount > 0 ? 'success' : 'error'}`}>{couponMsg}</p>}

          <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/checkout', { state: { discount } })}>
            Proceed to Checkout
          </button>
          <Link to="/" className="continue-link">Continue Shopping</Link>
        </aside>
      </div>

      <style>{`
        .cart-page { padding: 24px 16px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }
        .cart-items { display: flex; flex-direction: column; gap: 12px; }
        .cart-item {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 16px;
          padding: 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: #fff;
        }
        .cart-item-img {
          width: 100px;
          height: 100px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--color-light-gray);
        }
        .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .cart-item-info { display: flex; flex-direction: column; gap: 4px; }
        .cart-item-name {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cart-item-name:hover { color: var(--color-accent); }
        .cart-item-variant { font-size: 12px; color: var(--color-text-light); }
        .cart-item-price { font-size: 14px; color: var(--color-accent); font-weight: 600; margin-top: 4px; }
        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 2px;
        }
        .qty-control button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          background: var(--color-light-gray);
        }
        .qty-control button:hover { background: var(--color-accent); color: #fff; }
        .qty-control span { min-width: 24px; text-align: center; font-size: 13px; font-weight: 600; }
        .cart-item-total { font-size: 15px; font-weight: 700; }
        .remove-btn { color: var(--color-text-light); padding: 4px; }
        .remove-btn:hover { color: var(--color-accent); }
        .cart-summary {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          background: #fff;
          position: sticky;
          top: 80px;
        }
        .cart-summary h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .summary-row.discount { color: var(--color-success); }
        .summary-row.total {
          font-weight: 700;
          font-size: 18px;
          color: var(--color-text);
        }
        .shipping-note {
          font-size: 12px;
          color: var(--color-warning);
          margin: 4px 0;
        }
        .summary-divider {
          height: 1px;
          background: var(--color-border);
          margin: 12px 0;
        }
        .coupon-box {
          display: flex;
          gap: 8px;
          margin: 16px 0 8px;
        }
        .coupon-msg {
          font-size: 12px;
          margin-bottom: 12px;
        }
        .coupon-msg.success { color: var(--color-success); }
        .coupon-msg.error { color: var(--color-accent); }
        .continue-link {
          display: block;
          text-align: center;
          margin-top: 12px;
          font-size: 13px;
          color: var(--color-text-light);
        }
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-item { grid-template-columns: 80px 1fr; }
          .cart-item-actions { grid-column: 1 / -1; flex-direction: row; justify-content: space-between; align-items: center; }
        }
      `}</style>
    </div>
  );
}
