import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

export default function Security() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleShow = (key) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success(res.data.message || 'Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container security-page">
      <h1 className="page-title">
        <Lock size={22} /> Security
      </h1>

      <div className="security-card">
        <h3>Change Password</h3>
        <form onSubmit={handleSubmit} className="security-form">
          <label>
            Current Password
            <div className="password-wrap">
              <input
                type={show.current ? 'text' : 'password'}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
              <button type="button" onClick={() => toggleShow('current')}>
                {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label>
            New Password
            <div className="password-wrap">
              <input
                type={show.new ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                minLength={6}
                required
              />
              <button type="button" onClick={() => toggleShow('new')}>
                {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label>
            Confirm New Password
            <div className="password-wrap">
              <input
                type={show.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                minLength={6}
                required
              />
              <button type="button" onClick={() => toggleShow('confirm')}>
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <style>{`
        .security-page { padding: 24px 16px; max-width: 600px; }
        .page-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 24px; font-weight: 700; margin-bottom: 24px;
        }
        .security-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 24px;
          background: #fff;
        }
        .security-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .security-form {
          display: flex; flex-direction: column; gap: 14px;
        }
        .security-form label {
          display: flex; flex-direction: column; gap: 6px;
          font-size: 13px; font-weight: 500;
        }
        .password-wrap {
          position: relative;
          display: flex;
        }
        .password-wrap input {
          flex: 1;
          padding: 10px 40px 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
        }
        .password-wrap button {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-light);
        }
        .security-form .btn { margin-top: 8px; align-self: flex-start; }
      `}</style>
    </div>
  );
}