import { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import {
  Package,
  Heart,
  MapPin,
  LogOut,
  User,
  CreditCard,
  Lock,
  Settings,
  Wrench,
  Plus,
} from 'lucide-react';

export default function Account() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    if (!user) return;

    api
      .get('/auth/addresses')
      .then((r) => {
        const list = r.data.data || [];
        const defaultAddr = list.find((a) => a.isDefault) || list[0] || null;
        setAddress(defaultAddr);
      })
      .catch(() => setAddress(null))
      .finally(() => setLoadingAddress(false));
  }, [user]);

  // All hooks above this line run on every render, no matter what.
  // Only now is it safe to return early.
  if (loading) return null; // wait for auth check to finish
  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container account-page">
      <div className="account-card">
        {/* Profile header */}
        <div className="account-header">
          <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div className="header-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className={`role-badge ${user.role?.toLowerCase()}`}>
              🟢 {user.role}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-sm logout">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="divider" />

        {/* Delivery address */}
        <div className="address-section">
          <h3 className="section-heading">
            <MapPin size={16} /> Delivery Address
          </h3>

          {loadingAddress ? (
            <p className="address-empty">Loading address...</p>
          ) : address ? (
            <div className="address-block">
              <p className="address-label">{address.fullName || 'Home'}</p>
              <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
              <p>
                {address.city}, {address.state} - {address.pincode}
              </p>
              <p>+91 {address.phone}</p>
            </div>
          ) : (
            <p className="address-empty">No saved address yet.</p>
          )}

          <div className="address-actions">
            <Link to="/addresses" className="btn btn-outline btn-sm">
              Change Address
            </Link>
            <Link to="/addresses?add=true" className="btn btn-primary btn-sm">
              <Plus size={14} /> Add New Address
            </Link>
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <div className="account-menu">
        <Link to="/orders" className="menu-card">
          <Package size={24} color="#F43336" />
          <span>My Orders</span>
        </Link>
        <Link to="/wishlist" className="menu-card">
          <Heart size={24} color="#F43336" />
          <span>Wishlist</span>
        </Link>
        <Link to="/addresses" className="menu-card">
          <MapPin size={24} color="#F43336" />
          <span>Addresses</span>
        </Link>
        <Link to="/profile" className="menu-card">
          <User size={24} color="#F43336" />
          <span>Profile</span>
        </Link>
        <Link to="/payments" className="menu-card">
          <CreditCard size={24} color="#F43336" />
          <span>Payments</span>
        </Link>
        <Link to="/security" className="menu-card">
          <Lock size={24} color="#F43336" />
          <span>Security</span>
        </Link>
        <Link to="/settings" className="menu-card">
          <Settings size={24} color="#F43336" />
          <span>Settings</span>
        </Link>
        {user.role === 'ADMIN' && (
          <Link to="/admin" className="menu-card admin-menu-card">
            <Wrench size={24} color="#16A34A" />
            <span>Admin Panel</span>
          </Link>
        )}
      </div>

      <style>{`
        .account-page { padding: 24px 16px; max-width: 800px; }

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
          width: 56px;
          height: 56px;
          background: var(--color-accent);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .header-info h2 { font-size: 18px; font-weight: 600; margin-bottom: 2px; }
        .header-info p { font-size: 13px; color: var(--color-text-light); margin-bottom: 4px; }
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(22, 163, 74, 0.1);
          color: var(--color-success, #16A34A);
        }
        .role-badge.customer {
          background: rgba(244, 51, 54, 0.1);
          color: var(--color-accent);
        }
        .logout { margin-left: auto; }

        .divider {
          height: 1px;
          background: var(--color-border);
          margin: 20px 0;
        }

        .section-heading {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .address-block p {
          font-size: 13px;
          color: var(--color-text);
          line-height: 1.5;
        }
        .address-label { font-weight: 600; margin-bottom: 2px; }
        .address-empty {
          font-size: 13px;
          color: var(--color-text-light);
          margin-bottom: 12px;
        }
        .address-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .address-actions .btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .account-menu {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .menu-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px 16px;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text);
        }
        .menu-card:hover {
          border-color: var(--color-accent);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .admin-menu-card {
          border-color: #16A34A;
          background: rgba(22, 163, 74, 0.03);
        }

        @media (max-width: 900px) {
          .account-menu { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .logout { margin: 12px 0 0; }
          .address-actions { width: 100%; }
          .address-actions .btn { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
}