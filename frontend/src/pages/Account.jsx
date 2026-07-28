import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Package, Heart, MapPin, LogOut } from 'lucide-react';

export default function Account() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="container account-page">
      <h1 className="page-title">My Account</h1>
      <div className="account-card">
        <div className="account-header">
          <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            {user.phone && <p>{user.phone}</p>}
            <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
          </div>
          <button onClick={logout} className="btn btn-outline btn-sm logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="account-menu">
        <Link to="/orders" className="menu-card">
          <Package size={32} color="#F43336" />
          <h3>My Orders</h3>
          <p>Track and review your orders</p>
        </Link>
        <Link to="/wishlist" className="menu-card">
          <Heart size={32} color="#F43336" />
          <h3>Wishlist</h3>
          <p>View your saved products</p>
        </Link>
        <Link to="/cart" className="menu-card">
          <MapPin size={32} color="#F43336" />
          <h3>Addresses</h3>
          <p>Manage saved addresses</p>
        </Link>
        {user.role === 'ADMIN' && (
          <Link to="/admin" className="menu-card admin-menu-card">
            <Package size={32} color="#F43336" />
            <h3>Admin Panel</h3>
            <p>Manage products, orders, users</p>
          </Link>
        )}
      </div>

      <style>{`
        .account-page { padding: 24px 16px; max-width: 800px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .account-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 24px;
          background: #fff;
          margin-bottom: 24px;
        }
        .account-header {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .avatar {
          width: 64px;
          height: 64px;
          background: var(--color-accent);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .account-header h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
        .account-header p { font-size: 14px; color: var(--color-text-light); }
        .role-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 4px;
          background: rgba(244, 51, 54, 0.1);
          color: var(--color-accent);
          text-transform: uppercase;
        }
        .role-badge.admin { background: rgba(22, 163, 74, 0.1); color: var(--color-success); }
        .logout { margin-left: auto; }
        .account-menu {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .menu-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 24px;
          background: #fff;
          text-align: center;
          transition: all 0.2s;
        }
        .menu-card:hover {
          border-color: var(--color-accent);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .admin-menu-card {
          border-color: var(--color-accent);
          background: rgba(244, 51, 54, 0.03);
        }
        .menu-card h3 { font-size: 16px; font-weight: 600; margin: 12px 0 4px; }
        .menu-card p { font-size: 13px; color: var(--color-text-light); }
        @media (max-width: 900px) {
          .account-menu { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .account-menu { grid-template-columns: 1fr; }
          .logout { margin: 12px 0 0; }
        }
      `}</style>
    </div>
  );
}
