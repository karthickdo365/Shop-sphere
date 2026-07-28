import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  Image,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/banners', label: 'Banners', icon: Image },
    { to: '/admin/users', label: 'Users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <span className="brand-text">Shop<span className="brand-accent">Admin</span></span>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="view-store-link">
            <ExternalLink size={16} /> View Store
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="admin-user-info">
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f4f5f7;
        }
        .admin-sidebar {
          width: 260px;
          background: var(--color-dark);
          color: #fff;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          transition: transform 0.3s ease;
        }
        .admin-brand {
          padding: 22px 20px;
          border-bottom: 1px solid #3a3a3a;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand-text {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .brand-accent { color: var(--color-accent); }
        .close-sidebar {
          display: none;
          color: #fff;
          padding: 4px;
        }
        .admin-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 8px;
          color: #b8b8b8;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .admin-nav-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }
        .admin-nav-link.active {
          background: var(--color-accent);
          color: #fff;
        }
        .admin-sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid #3a3a3a;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .view-store-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          color: #b8b8b8;
          font-size: 13px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .view-store-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          color: var(--color-accent);
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          width: 100%;
          text-align: left;
          transition: background 0.2s;
        }
        .logout-btn:hover { background: rgba(244, 51, 54, 0.1); }
        .admin-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .admin-topbar {
          background: #fff;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .mobile-toggle {
          display: none;
          padding: 6px;
        }
        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--color-accent);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .user-name { font-size: 14px; font-weight: 600; }
        .user-role { font-size: 11px; color: var(--color-text-light); }
        .admin-content {
          padding: 24px;
          flex: 1;
        }
        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 99;
        }
        @media (max-width: 900px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0; }
          .close-sidebar { display: flex; }
          .mobile-toggle { display: flex; }
          .admin-overlay { display: block; }
          .admin-content { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
