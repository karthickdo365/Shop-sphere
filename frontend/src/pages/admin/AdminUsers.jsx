import { useEffect, useState } from 'react';
import { Search, Shield, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('q', search);
      const r = await api.get(`/auth/admin/users?${params.toString()}`);
      setUsers(r.data.data);
      setPagination(r.data.pagination);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page, search]);

  const toggleRole = async (u) => {
    const next = u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (!confirm(`Change ${u.name}'s role to ${next}?`)) return;
    try {
      await api.put(`/auth/admin/users/${u.id}/role`, { role: next });
      toast.success('Role updated');
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="admin-users">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>{pagination.total || 0} registered users</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#999" />
          <input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state"><p>No users found.</p></div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td>
                      <span className={`role-pill ${u.role.toLowerCase()}`}>
                        {u.role === 'ADMIN' ? <Shield size={11} /> : <UserIcon size={11} />}
                        {u.role}
                      </span>
                    </td>
                    <td>{u._count?.orders || 0}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => toggleRole(u)}
                      >
                        {u.role === 'ADMIN' ? 'Make Customer' : 'Make Admin'}
                      </button>
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

      <style>{`
        .admin-users { max-width: 1200px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--color-text-light); font-size: 14px; margin-top: 4px; }
        .toolbar { margin-bottom: 16px; }
        .search-box {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid var(--color-border);
          padding: 8px 14px; border-radius: 8px;
          max-width: 360px;
        }
        .search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; }
        .table-wrap { background: #fff; border-radius: 12px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th {
          text-align: left; padding: 12px 16px;
          font-size: 11px; font-weight: 600; color: var(--color-text-light);
          text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
        }
        .admin-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .user-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--color-accent); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px;
        }
        .role-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 12px;
          font-size: 11px; font-weight: 600; text-transform: uppercase;
        }
        .role-pill.admin { background: rgba(22, 163, 74, 0.15); color: #15803d; }
        .role-pill.customer { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
        .empty-state { background: #fff; padding: 60px 20px; text-align: center; border-radius: 12px; color: var(--color-text-light); }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
        .pagination button { padding: 8px 14px; border: 1px solid var(--color-border); background: #fff; border-radius: 6px; font-size: 13px; }
        .pagination button:hover:not(:disabled) { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
        .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
