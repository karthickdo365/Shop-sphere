import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Banknote, Wallet, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/helpers.js';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const discount = location.state?.discount || 0;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!cart || cart.items?.length === 0) { navigate('/cart'); return; }
    api.get('/auth/addresses').then((r) => {
      setAddresses(r.data.data);
      const def = r.data.data.find((a) => a.isDefault);
      if (def) setSelectedAddress(def.id);
    });
  }, [user, cart, navigate]);

  if (!cart || cart.items?.length === 0) return null;

  const subtotal = cart.items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal - discount + shipping;
  const codAllowed = total <= 5000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'COD' && !codAllowed) {
      toast.error('COD only available for orders up to ₹5,000');
      return;
    }
    setPlacing(true);
    try {
      // Save address if new
      let addressId = selectedAddress;
      if (!addressId) {
        const addr = await api.post('/auth/addresses', { ...form, isDefault: addresses.length === 0 });
        addressId = addr.data.data.id;
      }

      // Create order with selected payment method
      const order = await api.post('/orders', {
        items: cart.items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.priceAtAdd,
        })),
        addressId,
        paymentMethod,
      });

      const orderId = order.data.data.id;

      if (paymentMethod === 'RAZORPAY') {
        // Mock Razorpay payment success (in production, open Razorpay checkout here)
        // If real Razorpay keys are configured, this is where you'd integrate:
        //   const rzp = new window.Razorpay({ key, amount, order_id, ... })
        //   rzp.open()
        //   rzp.on('payment.success', handler)
        await api.post(`/orders/${orderId}/pay`, {
          razorpayPaymentId: 'mock_pay_' + Date.now(),
          razorpaySignature: 'mock_sig_' + Date.now(),
        });
        toast.success('Payment successful! Order placed.');
      } else if (paymentMethod === 'COD') {
        toast.success('Order placed! Pay cash on delivery.');
      }

      await clearCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-layout">
        <div className="checkout-main">
          {/* Address */}
          <section className="checkout-section">
            <h3>Shipping Address</h3>
            {addresses.length > 0 && (
              <div className="saved-addresses">
                {addresses.map((a) => (
                  <label key={a.id} className={`address-card ${selectedAddress === a.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === a.id}
                      onChange={() => setSelectedAddress(a.id)}
                    />
                    <div>
                      <strong>{a.fullName}</strong> - {a.phone}
                      <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                      <p>{a.city}, {a.state} - {a.pincode}</p>
                    </div>
                  </label>
                ))}
                <button type="button" className="new-address-btn" onClick={() => setSelectedAddress(null)}>
                  + Use new address
                </button>
              </div>
            )}

            {!selectedAddress && (
              <div className="address-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label className="form-label">Address Line 1</label>
                  <input className="form-input" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label className="form-label">Address Line 2 (optional)</label>
                  <input className="form-input" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                </div>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="checkout-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'RAZORPAY' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                />
                <div className="pay-icon"><CreditCard size={22} /></div>
                <div className="pay-info">
                  <strong>Razorpay</strong>
                  <p>UPI / Cards / Net Banking / Wallets</p>
                </div>
                <span className="pay-badge">INSTANT</span>
              </label>

              <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''} ${!codAllowed ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => codAllowed && setPaymentMethod('COD')}
                  disabled={!codAllowed}
                />
                <div className="pay-icon"><Banknote size={22} /></div>
                <div className="pay-info">
                  <strong>Cash on Delivery</strong>
                  <p>{codAllowed ? 'Pay in cash when your order arrives' : `Available only for orders up to ${formatPrice(5000)}`}</p>
                </div>
                {codAllowed && <span className="pay-badge cod">COD</span>}
              </label>

              <div className="pay-info-note">
                <Truck size={14} />
                <span>Free shipping on orders above {formatPrice(999)}. Delivery in 3-7 business days.</span>
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="mini-items">
            {cart.items.map((i) => (
              <div key={i.id} className="mini-item">
                <span className="mini-qty">{i.quantity}&times;</span>
                <span className="mini-name">{i.product.name.substring(0, 50)}...</span>
                <span className="mini-price">{formatPrice(i.priceAtAdd * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="summary-row discount"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
          <div className="summary-divider" />
          <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>

          <div className="pay-summary-box">
            <Wallet size={16} />
            <span>Paying via: <strong>{paymentMethod === 'RAZORPAY' ? 'Razorpay (Online)' : 'Cash on Delivery'}</strong></span>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={placing}>
            {placing ? 'Placing Order...' : `Place Order - ${formatPrice(total)}`}
          </button>
        </aside>
      </form>

      <style>{`
        .checkout-page { padding: 24px 16px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }
        .checkout-section {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          background: #fff;
          margin-bottom: 16px;
        }
        .checkout-section h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .saved-addresses { display: flex; flex-direction: column; gap: 10px; }
        .address-card {
          display: flex;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          cursor: pointer;
        }
        .address-card.selected { border-color: var(--color-accent); background: rgba(244, 51, 54, 0.05); }
        .address-card strong { display: block; font-size: 14px; margin-bottom: 4px; }
        .address-card p { font-size: 13px; color: var(--color-text-light); }
        .new-address-btn {
          text-align: left;
          color: var(--color-accent);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 0;
        }
        .address-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .form-group.full { grid-column: 1 / -1; }
        .payment-options { display: flex; flex-direction: column; gap: 10px; }
        .payment-option {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .payment-option.selected {
          border-color: var(--color-accent);
          background: rgba(244, 51, 54, 0.04);
          box-shadow: 0 0 0 1px var(--color-accent);
        }
        .payment-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .payment-option input { margin: 0; }
        .pay-icon {
          width: 40px; height: 40px;
          border-radius: 8px;
          background: var(--color-light-gray);
          display: flex; align-items: center; justify-content: center;
          color: var(--color-text);
          flex-shrink: 0;
        }
        .payment-option.selected .pay-icon {
          background: var(--color-accent);
          color: #fff;
        }
        .pay-info { flex: 1; }
        .pay-info strong { display: block; font-size: 14px; }
        .pay-info p { font-size: 12px; color: var(--color-text-light); margin-top: 2px; }
        .pay-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          background: rgba(59, 130, 246, 0.15);
          color: #2563eb;
          text-transform: uppercase;
        }
        .pay-badge.cod { background: rgba(22, 163, 74, 0.15); color: #15803d; }
        .pay-info-note {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--color-light-gray);
          border-radius: 6px;
          font-size: 12px;
          color: var(--color-text-light);
          margin-top: 8px;
        }
        .checkout-summary {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          background: #fff;
          position: sticky;
          top: 80px;
        }
        .checkout-summary h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
        .mini-items { max-height: 200px; overflow-y: auto; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
        .mini-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 8px;
          font-size: 12px;
          color: var(--color-text-light);
        }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .summary-row.discount { color: var(--color-success); }
        .summary-row.total { font-weight: 700; font-size: 18px; }
        .summary-divider { height: 1px; background: var(--color-border); margin: 12px 0; }
        .pay-summary-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--color-light-gray);
          border-radius: 6px;
          font-size: 12px;
          margin: 14px 0;
        }
        .pay-summary-box strong { color: var(--color-accent); }
        @media (max-width: 768px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .address-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
