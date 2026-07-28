import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { formatPrice, getFirstImage } from '../utils/helpers.js';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#16a34a',
  CANCELLED: '#ef4444',
  RETURNED: '#6b7280',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((r) => setOrders(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  if (orders.length === 0) {
    return (
      <div className="container empty-orders">
        <h1>No orders yet</h1>
        <p>When you place an order, it will appear here.</p>
        <Link to="/" className="btn btn-primary">Start Shopping</Link>
        <style>{`
          .empty-orders { text-align: center; padding: 60px 20px; }
          .empty-orders h1 { font-size: 24px; margin-bottom: 8px; }
          .empty-orders p { color: var(--color-text-light); margin-bottom: 16px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <h1 className="page-title">My Orders</h1>
      <div className="orders-list">
        {orders.map((o) => (
          <div key={o.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{o.orderNumber}</h3>
                <p className="order-date">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="order-status">
                <span className="status-pill" style={{ background: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}>
                  {o.status}
                </span>
                <span className={`payment-pill ${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span>
                <span className={`pay-method-pill ${o.paymentMethod?.toLowerCase()}`}>{o.paymentMethod}</span>
              </div>
            </div>
            <div className="order-items">
              {o.items.map((item) => (
                <div key={item.id} className="order-item">
                  <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} />
                  <div>
                    <p className="item-name">{item.name}</p>
                    <p className="item-variant">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                  </div>
                  <p className="item-price">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <p>Total: <strong>{formatPrice(o.total)}</strong></p>
              {o.status === 'PENDING' || o.status === 'CONFIRMED' ? (
                <button className="btn btn-outline btn-sm cancel-btn" onClick={async () => {
                  if (confirm('Cancel this order?')) {
                    await api.post(`/orders/${o.id}/cancel`);
                    setOrders(orders.map((x) => (x.id === o.id ? { ...x, status: 'CANCELLED' } : x)));
                  }
                }}>Cancel Order</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .orders-page { padding: 24px 16px; max-width: 900px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .orders-list { display: flex; flex-direction: column; gap: 16px; }
        .order-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          background: #fff;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        .order-header h3 { font-size: 16px; font-weight: 600; }
        .order-date { font-size: 13px; color: var(--color-text-light); margin-top: 4px; }
        .order-status { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
        .status-pill {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .payment-pill {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--color-light-gray);
        }
        .payment-pill.paid { background: rgba(22, 163, 74, 0.1); color: var(--color-success); }
        .payment-pill.pending { background: rgba(245, 158, 11, 0.1); color: var(--color-warning); }
        .payment-pill.failed, .payment-pill.refunded { background: rgba(244, 51, 54, 0.1); color: var(--color-accent); }
        .pay-method-pill {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 600;
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        }
        .pay-method-pill.cod {
          background: rgba(139, 92, 246, 0.1);
          color: #7c3aed;
        }
        .order-items { display: flex; flex-direction: column; gap: 12px; }
        .order-item {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 12px;
          align-items: center;
        }
        .order-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; background: var(--color-light-gray); }
        .item-name { font-size: 14px; font-weight: 500; line-height: 1.4; }
        .item-variant { font-size: 12px; color: var(--color-text-light); }
        .item-price { font-weight: 600; }
        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
        }
        .order-footer p { font-size: 15px; }
        .order-footer strong { font-weight: 700; }
        .cancel-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
      `}</style>
    </div>
  );
}
