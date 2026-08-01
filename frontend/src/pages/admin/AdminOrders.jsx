import { useEffect, useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api.js';
import { formatPrice } from '../../utils/helpers.js';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const PAYMENTS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      const r = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(r.data.data);
      setStats(r.data.stats);
      setPagination(r.data.pagination);
    } catch (e) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  const updateStatus = async (id, status, paymentStatus) => {
    try {
      const payload = {};
      if (status) payload.status = status;
      if (paymentStatus) payload.paymentStatus = paymentStatus;
      await api.put(`/orders/admin/${id}/status`, payload);
      toast.success('Order updated');
      fetchOrders();
      if (selected?.id === id) {
        setSelected({ ...selected, ...payload });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="admin-orders">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>{pagination.total || 0} total orders</p>
        </div>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="stat-row">
          <div className="stat-mini">
            <p className="lbl">Total Revenue</p>
            <p className="val">{formatPrice(stats.totalRevenue)}</p>
          </div>
          <div className="stat-mini">
            <p className="lbl">Paid Revenue</p>
            <p className="val">{formatPrice(stats.paidRevenue)}</p>
          </div>
          <div className="stat-mini">
            <p className="lbl">Total Orders</p>
            <p className="val">{stats.totalOrders}</p>
          </div>
          <div className="stat-mini warn">
            <p className="lbl">Pending</p>
            <p className="val">{stats.pendingOrders}</p>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#999" />
          <input
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="status-filter-buttons">
          <button
            className={statusFilter === '' ? 'active' : ''}
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
          >
            ALL
          </button>
          {STATUSES.map((status) => (
            <button
              key={status}
              className={statusFilter === status ? 'active' : ''}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><p>No orders found.</p></div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td>
                      {o.user?.name || 'Guest'}
                      <br />
                      <span className="muted">{o.user?.email}</span>
                    </td>
                    <td>{o.items?.length || 0} items</td>
                    <td><strong>{formatPrice(o.total)}</strong></td>
                    <td>
                      <span className={`status-pill pay-${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span>
                    </td>
                    <td>
                      <span className={`status-pill status-${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(o)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&laquo; Prev</button>
              <span>Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next &raquo;</button>
            </div>
          )}
        </>
      )}

      {/* Order Detail Drawer */}
      {selected && (
        <div className="drawer-overlay" onClick={() => setSelected(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2>{selected.orderNumber}</h2>
                <p className="muted">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <h4>Customer</h4>
                <p><strong>{selected.user?.name}</strong></p>
                <p>{selected.user?.email}</p>
                {selected.user?.phone && <p>{selected.user.phone}</p>}
              </div>

              {selected.address && (
                <div className="drawer-section">
                  <h4>Shipping Address</h4>
                  <p>{selected.address.fullName}</p>
                  <p>{selected.address.line1}{selected.address.line2 ? `, ${selected.address.line2}` : ''}</p>
                  <p>{selected.address.city}, {selected.address.state} - {selected.address.pincode}</p>
                  <p>Phone: {selected.address.phone}</p>
                </div>
              )}

              <div className="drawer-section">
                <h4>Items</h4>
                <ul className="order-items">
                  {selected.items?.map((i) => (
                    <li key={i.id}>
                      <img
                        src={i.image || "https://via.placeholder.com/70"}
                        alt={i.name}
                        className="oi-image"
                      />

                      <div className="oi-info">
                        <p className="oi-name">{i.name}</p>

                        <p className="oi-variant">
                          {i.size} · {i.color} · Qty {i.quantity}
                        </p>
                      </div>

                      <p className="oi-price">
                        {formatPrice(i.price * i.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="drawer-section summary">
                <div className="sum-row"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                <div className="sum-row"><span>Shipping</span><span>{selected.shipping === 0 ? 'FREE' : formatPrice(selected.shipping)}</span></div>
                <div className="sum-row total"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
              </div>

              <div className="drawer-section">
                <h4>Update Status</h4>
                <div className="status-grid">
                  <label>Order Status
                    <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                  <label>Payment Status
                    <select value={selected.paymentStatus} onChange={(e) => updateStatus(selected.id, null, e.target.value)}>
                      {PAYMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
      .oi-image{
  width:70px;
  height:70px;
  object-fit:cover;
  border-radius:8px;
  border:1px solid #ddd;
  flex-shrink:0;
}

.order-items li{
  display:flex;
  align-items:center;
  gap:12px;
}

.oi-info{
  flex:1;
}
  .status-pill.status-pending{
  background:#fff3cd;
  color:#b45309;
}

.status-pill.status-confirmed{
  background:#dbeafe;
  color:#2563eb;
}

.status-pill.status-shipped{
  background:#ede9fe;
  color:#7c3aed;
}

.status-pill.status-delivered{
  background:#dcfce7;
  color:#15803d;
}

.status-pill.status-cancelled{
  background:#fee2e2;
  color:#b91c1c;
}

.status-pill.status-returned{
  background:#f3f4f6;
  color:#4b5563;
}
        .admin-orders { max-width: 1200px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--color-text-light); font-size: 14px; margin-top: 4px; }
        .stat-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-mini {
          background: #fff;
          padding: 14px 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .stat-mini.warn { border-left: 3px solid var(--color-warning); }
        .stat-mini .lbl { font-size: 11px; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .stat-mini .val { font-size: 20px; font-weight: 700; }
      .toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.status-filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-filter-buttons button {
  padding: 7px 16px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-light);
  letter-spacing: 0.3px;
  transition: all 0.15s;
  white-space: nowrap;
}

.status-filter-buttons button:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  color: var(--color-text);
}

.status-filter-buttons button.active {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--color-border);
  padding: 9px 14px;
  border-radius: 8px;
  width: 100%;
  max-width: 360px;
}
        .search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; }
        .filter-select {
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: #fff;
          font-size: 14px;
        }
        .table-wrap {
          background: #fff;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
        }
        .admin-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .admin-table td .muted { font-size: 11px; color: var(--color-text-light); }
        .status-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill.pay-pending { background: rgba(245, 158, 11, 0.15); color: #b45309; }
        .status-pill.pay-paid { background: rgba(22, 163, 74, 0.15); color: #15803d; }
        .status-pill.pay-failed, .status-pill.pay-refunded { background: rgba(244, 51, 54, 0.15); color: #b91c1c; }
        .status-select-wrap { position: relative; display: inline-block; }
        .status-select {
          padding: 6px 28px 6px 10px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          background: #fff;
          appearance: none;
          cursor: pointer;
        }
        .status-select.status-pending { background: rgba(245, 158, 11, 0.1); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }
        .status-select.status-confirmed { background: rgba(59, 130, 246, 0.1); color: #2563eb; border-color: rgba(59, 130, 246, 0.3); }
        .status-select.status-shipped { background: rgba(139, 92, 246, 0.1); color: #7c3aed; border-color: rgba(139, 92, 246, 0.3); }
        .status-select.status-delivered { background: rgba(22, 163, 74, 0.1); color: #15803d; border-color: rgba(22, 163, 74, 0.3); }
        .status-select.status-cancelled { background: rgba(244, 51, 54, 0.1); color: #b91c1c; border-color: rgba(244, 51, 54, 0.3); }
        .status-select.status-returned { background: rgba(107, 114, 128, 0.1); color: #4b5563; border-color: rgba(107, 114, 128, 0.3); }
        .chevron { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #999; }
        .empty-state { background: #fff; padding: 60px 20px; text-align: center; border-radius: 12px; color: var(--color-text-light); }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
        .pagination button { padding: 8px 14px; border: 1px solid var(--color-border); background: #fff; border-radius: 6px; font-size: 13px; }
        .pagination button:hover:not(:disabled) { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
        .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Drawer */
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 200;
          display: flex;
          justify-content: flex-end;
        }
        .drawer {
          background: #fff;
          width: 100%;
          max-width: 460px;
          overflow-y: auto;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .drawer-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 1;
        }
        .drawer-header h2 { font-size: 18px; font-weight: 600; }
        .drawer-header .muted { font-size: 12px; color: var(--color-text-light); margin-top: 4px; }
        .drawer-header button { color: var(--color-text-light); padding: 4px; }
        .drawer-body { padding: 24px; }
        .drawer-section { padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--color-border); }
        .drawer-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .drawer-section h4 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-light); margin-bottom: 10px; }
        .drawer-section p { font-size: 14px; line-height: 1.6; }
        .order-items { list-style: none; padding: 0; margin: 0; }
        .order-items li {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-border);
          gap: 12px;
        }
        .order-items li:last-child { border-bottom: none; }
        .oi-name { font-size: 13px; font-weight: 500; line-height: 1.4; }
        .oi-variant { font-size: 12px; color: var(--color-text-light); margin-top: 2px; }
        .oi-price { font-weight: 600; font-size: 13px; }
        .summary .sum-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .summary .sum-row.total { font-weight: 700; font-size: 16px; padding-top: 12px; border-top: 1px solid var(--color-border); }
        .status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .status-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--color-text-light); }
        .status-grid select { padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 14px; }
      `}</style>
    </div>
  );
}