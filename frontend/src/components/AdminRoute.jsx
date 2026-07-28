import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AdminLayout from './AdminLayout.jsx';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Access Denied</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '20px' }}>
          You need admin privileges to access this page.
        </p>
        <a href="/" className="btn btn-primary">Back to Home</a>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
