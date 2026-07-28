import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../../utils/api.js';
import { formatPrice, getFirstImage } from '../../utils/helpers.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/admin/all?limit=5').catch(() => ({ data: { data: [], stats: null } })),
      api.get('/products/admin/all?limit=5').catch(() => ({ data: { data: [] } })),
    ]).then(([ordersRes, productsRes]) => {
      setStats(ordersRes.data.stats);
      setRecentOrders(ordersRes.data.data);
      setTopProducts(productsRes.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: IndianRupee,
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.1)',
      sub: `${formatPrice(stats?.paidRevenue || 0)} paid`,
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      sub: `${stats?.pendingOrders || 0} pending`,
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      sub: 'Needs attention',
    },
    {
      label: 'Paid Orders',
      value: stats?.paidOrders || 0,
      icon: CheckCircle2,
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.1)',
      sub: `${formatPrice(stats?.paidRevenue || 0)} collected`,
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, here's your store overview</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="stat-info">
              <p className="stat-label">{s.label}</p>
              <h3 className="stat-value">{s.value}</h3>
              <p className="stat-sub">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all">View All</Link>
          </div>
          <div className="panel-body">
            {recentOrders.length === 0 ? (
              <p className="empty-text">No orders yet</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><strong>{o.orderNumber}</strong></td>
                      <td>{o.user?.name || 'Guest'}<br/><span className="muted">{o.user?.email}</span></td>
                      <td><strong>{formatPrice(o.total)}</strong></td>
                      <td><span className={`status-pill ${o.status.toLowerCase()}`}>{o.status}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="panel">
          <div className="panel-header">
            <h2>Recent Products</h2>
            <Link to="/admin/products" className="view-all">View All</Link>
          </div>
          <div className="panel-body">
            {topProducts.length === 0 ? (
              <p className="empty-text">No products yet</p>
            ) : (
              <ul className="product-mini-list">
                {topProducts.map((p) => (
                  <li key={p.id}>
                    <img src={getFirstImage(p)} alt={p.name} />
                    <div className="mini-info">
                      <p className="mini-name">{p.name.substring(0, 50)}...</p>
                      <p className="mini-cat">{p.category?.name}</p>
                    </div>
                    <div className="mini-right">
                      <p className="mini-price">{formatPrice(p.discountPrice ?? p.basePrice)}</p>
                      <p className="mini-stock">{p.variants?.reduce((s, v) => s + v.stock, 0) || 0} in stock</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard { max-width: 1200px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--color-text-light); font-size: 14px; margin-top: 4px; }
        .stat-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-label { font-size: 12px; color: var(--color-text-light); margin-bottom: 4px; }
        .stat-value { font-size: 22px; font-weight: 700; }
        .stat-sub { font-size: 11px; color: var(--color-text-light); margin-top: 2px; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        .panel {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .panel-header h2 { font-size: 16px; font-weight: 600; }
        .view-all { font-size: 13px; color: var(--color-accent); font-weight: 500; }
        .panel-body { padding: 16px 20px; }
        .empty-text { text-align: center; color: var(--color-text-light); padding: 24px 0; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th {
          text-align: left;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--color-border);
        }
        .admin-table td {
          padding: 12px;
          border-bottom: 1px solid var(--color-border);
        }
        .admin-table td .muted { font-size: 11px; color: var(--color-text-light); }
        .status-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill.pending { background: rgba(245, 158, 11, 0.15); color: #b45309; }
        .status-pill.confirmed { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
        .status-pill.shipped { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }
        .status-pill.delivered { background: rgba(22, 163, 74, 0.15); color: #15803d; }
        .status-pill.cancelled { background: rgba(244, 51, 54, 0.15); color: #b91c1c; }
        .status-pill.returned { background: rgba(107, 114, 128, 0.15); color: #4b5563; }
        .product-mini-list { list-style: none; padding: 0; margin: 0; }
        .product-mini-list li {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-border);
          align-items: center;
        }
        .product-mini-list li:last-child { border-bottom: none; }
        .product-mini-list img {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
          background: var(--color-light-gray);
        }
        .mini-name { font-size: 13px; font-weight: 500; line-height: 1.3; }
        .mini-cat { font-size: 11px; color: var(--color-text-light); margin-top: 2px; }
        .mini-right { text-align: right; }
        .mini-price { font-size: 13px; font-weight: 600; color: var(--color-accent); }
        .mini-stock { font-size: 11px; color: var(--color-text-light); }
        @media (max-width: 900px) {
          .stat-cards { grid-template-columns: repeat(2, 1fr); }
          .dashboard-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stat-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
