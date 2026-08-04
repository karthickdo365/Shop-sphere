import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully. Please login.");
      // Clean the URL so refreshing the page doesn't re-trigger the toast
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login to your ShopSphere account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-row-between">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      <style>{`
        .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
        .auth-card { background: #fff; padding: 36px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); max-width: 420px; width: 100%; }
        .auth-card h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .auth-card > p { color: var(--color-text-light); margin-bottom: 24px; font-size: 14px; }
        .password-wrap { position: relative; }
        .password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          padding: 6px;
          color: var(--color-text-light);
          background: transparent;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .password-toggle:hover { color: var(--color-accent); background: rgba(244, 51, 54, 0.08); }
        .form-row-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 13px; }
        .remember-me { display: flex; align-items: center; gap: 6px; color: var(--color-text-light); cursor: pointer; }
        .remember-me input { margin: 0; }
        .forgot-link { color: var(--color-accent); font-weight: 500; }
        .forgot-link:hover { text-decoration: underline; }
        .auth-switch { text-align: center; margin-top: 16px; font-size: 13px; color: var(--color-text-light); }
        .auth-switch a { color: var(--color-accent); font-weight: 500; }
      `}</style>
    </div>
  );
}