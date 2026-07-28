import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent (check your email)');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {sent ? (
          <>
            <div className="success-icon">
              <CheckCircle2 size={56} color="#16a34a" />
            </div>
            <h1>Check Your Email</h1>
            <p>
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              The link expires in 1 hour.
            </p>
            <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-light)' }}>
              Don't see the email? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                style={{ color: 'var(--color-accent)', background: 'none', fontWeight: 500, textDecoration: 'underline' }}
              >
                try again
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <h1>Forgot Password</h1>
            <p>Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-with-icon">
                  <Mail size={16} color="#999" />
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Sending...' : 'SEND RESET LINK'}
              </button>
            </form>
          </>
        )}
        <p className="auth-switch">
          <Link to="/login" className="back-link">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </p>
      </div>

      <style>{`
        .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
        .auth-card { background: #fff; padding: 36px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); max-width: 420px; width: 100%; }
        .auth-card h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .auth-card > p { color: var(--color-text-light); margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
        .success-icon { text-align: center; margin-bottom: 16px; }
        .input-with-icon { position: relative; }
        .input-with-icon svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
        .auth-switch { text-align: center; margin-top: 20px; font-size: 13px; color: var(--color-text-light); }
        .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--color-accent); font-weight: 500; }
        .back-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
