import { useState } from 'react';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEditing = () => {
    setForm({ name: user.name || '', phone: user.phone || '' });
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await api.put('/auth/profile', form);
      const updated = res.data.data;
      setUser(updated);
      localStorage.setItem('ss_user', JSON.stringify(updated));
      toast.success(res.data.message || 'Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container profile-page">
      <h1 className="page-title">
        <User size={22} /> Profile
      </h1>

      <div className="profile-card">
        <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>

        {!editing ? (
          <>
            <div className="profile-field">
              <span className="field-label">Full Name</span>
              <span className="field-value">{user.name}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email</span>
              <span className="field-value">{user.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Phone</span>
              <span className="field-value">{user.phone || 'Not added'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Role</span>
              <span className="field-value">{user.role}</span>
            </div>

            <button className="btn btn-primary btn-sm edit-btn" onClick={startEditing}>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </label>
            <label>
              Email
              <input type="email" value={user.email} disabled />
              <span className="field-hint">Email can't be changed here</span>
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .profile-page { padding: 24px 16px; max-width: 600px; }
        .page-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 24px; font-weight: 700; margin-bottom: 24px;
        }
        .profile-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 24px;
          background: #fff;
        }
        .avatar {
          width: 64px; height: 64px;
          background: var(--color-accent);
          color: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 700;
          margin-bottom: 20px;
        }
        .profile-field {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 14px;
        }
        .profile-field:last-of-type { border-bottom: none; }
        .field-label { color: var(--color-text-light); }
        .field-value { font-weight: 500; }
        .edit-btn { margin-top: 16px; }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .profile-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        .profile-form input {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
        }
        .profile-form input:disabled {
          background: var(--color-light-gray, #f5f5f5);
          color: var(--color-text-light);
        }
        .field-hint {
          font-size: 11px;
          color: var(--color-text-light);
          font-weight: 400;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}