import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setValidToken(false);
      return;
    }
    api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then(() => setValidToken(true))
      .catch(() => setValidToken(false))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Password reset successfully');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div className="loader" style={{ padding: '20px 0' }}><div className="spinner" /></div>
          <p>Verifying token...</p>
        </div>
      </div>
    );
  }

  if (!validToken && !success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="error-icon"><AlertCircle size={56} color="#f43336" /></div>
          <h1>Invalid or Expired Link</h1>
          <p>This password reset link is no longer valid. It may have expired (1 hour) or already been used.</p>
          <Link to="/forgot-password" className="btn btn-primary btn-block" style={{ marginTop: '16px' }}>
            Request New Link
          </Link>
          <p className="auth-switch">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
        <style>{`
          .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
          .auth-card { background: #fff; padding: 36px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); max-width: 420px; width: 100%; text-align: center; }
          .auth-card h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
          .auth-card > p { color: var(--color-text-light); margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
          .error-icon { margin-bottom: 12px; }
          .auth-switch { text-align: center; margin-top: 20px; font-size: 13px; color: var(--color-text-light); }
          .auth-switch a { color: var(--color-accent); font-weight: 500; }
        `}</style>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div className="success-icon"><CheckCircle2 size={56} color="#16a34a" /></div>
          <h1>Password Reset!</h1>
          <p>Your password has been changed successfully. Redirecting to login...</p>
        </div>
        <style>{`
          .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
          .auth-card { background: #fff; padding: 36px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); max-width: 420px; width: 100%; text-align: center; }
          .auth-card h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
          .auth-card > p { color: var(--color-text-light); font-size: 14px; line-height: 1.6; }
          .success-icon { margin-bottom: 12px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set New Password</h1>
        <p>Choose a new password for your account.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="password-wrap">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Resetting...' : 'RESET PASSWORD'}
          </button>
        </form>
        <p className="auth-switch">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>

      <style>{`
        .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
        .auth-card { background: #fff; padding: 36px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); max-width: 420px; width: 100%; }
        .auth-card h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .auth-card > p { color: var(--color-text-light); margin-bottom: 24px; font-size: 14px; }
        .password-wrap { position: relative; }
        .password-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          padding: 6px; color: var(--color-text-light); background: transparent; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .password-toggle:hover { color: var(--color-accent); background: rgba(244, 51, 54, 0.08); }
        .auth-switch { text-align: center; margin-top: 20px; font-size: 13px; color: var(--color-text-light); }
        .auth-switch a { color: var(--color-accent); font-weight: 500; }
      `}</style>
    </div>
  );
}
