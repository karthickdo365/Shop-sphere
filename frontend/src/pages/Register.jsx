import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, MessageSquare, Smartphone, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CHANNELS = [
  {
    value: "WHATSAPP",
    label: "WhatsApp",
    icon: MessageSquare,
    hint: "OTP will be sent via WhatsApp",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP verify
  const [form, setForm] = useState({ name: '',  phone: '' });
const [channel] = useState("WHATSAPP");
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const t = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    // if (form.password.length < 6) {
    //   toast.error('Password must be at least 6 characters');
    //   return;
    // }
    if (channel !== 'EMAIL' && !form.phone) {
      toast.error(`Phone number is required for ${channel}`);
      return;
    }
    setSendingOtp(true);
    try {
      await api.post('/otp/send', {
        email: form.email,
        phone: form.phone,
        purpose: 'REGISTER',
        channel,
      });
      toast.success(`OTP sent via ${channel.toLowerCase()}${channel !== 'EMAIL' && form.phone ? ` to ${form.phone}` : ` to ${form.email}`}`);
      setStep(2);
      startResendTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: verify OTP + register
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      // 1. Verify OTP
      await api.post('/otp/verify', { email: form.email, code, purpose: 'REGISTER' });
      // 2. Register account (with otpVerified=true so backend knows email is verified)
      const payload = {
  ...form,
  otpVerified: true,
};

console.log("REGISTER PAYLOAD:", payload);

await register(payload);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      // Clear OTP boxes on failure
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setSendingOtp(true);
    try {
      await api.post('/otp/resend', {
        email: form.email,
        phone: form.phone,
        purpose: 'REGISTER',
        channel,
      });
      toast.success('New OTP sent');
      startResendTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return; // single digit only
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    // Auto-advance to next box
    if (value && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-${idx - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length > 0) {
      const next = text.split('').padEnd(6, '').slice(0, 6).map((c) => c || '');
      setOtp(next);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {step === 1 ? (
          <>
            <h1>Create Account</h1>
            
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {/* <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div> */}
              <div className="form-group">
                <label className="form-label">Phone (with country code, e.g. +91...)</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
                <p className="hint">
  OTP will be sent to your WhatsApp number.
</p>
              </div>
              { /* <div className="form-group">
                <label className="form-label">Password (min 6 chars)</label>
                <div className="password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              // </div> */}

              <div className="form-group">
                <label className="form-label">Send OTP via</label>
                <div className="channel-grid">
                  {CHANNELS.map((c) => (
                    <label key={c.value} className={`channel-option ${channel === c.value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="channel"
                        checked={channel === c.value}
                        onChange={() => setChannel(c.value)}
                      />
                      <c.icon size={18} />
                      <div>
                        <strong>{c.label}</strong>
                        <p>{c.hint}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={sendingOtp}>
                {sendingOtp ? 'Sending OTP...' : 'SEND OTP & CONTINUE'}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </>
        ) : (
          <>
            <h1>Verify OTP</h1>
            <p>
              We've sent a 6-digit code to{' '}
              <strong>{channel === 'EMAIL' ? form.email : form.phone}</strong> via{' '}
              <strong>{channel.toLowerCase()}</strong>.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="dev-hint">
                <strong>Dev mode:</strong> Check the backend console for the OTP code.
              </p>
            )}
            <form onSubmit={handleVerify}>
              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="otp-box"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Verifying...' : 'VERIFY & CREATE ACCOUNT'}
              </button>
            </form>
            <div className="otp-actions">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="link-btn"
              >
                &larr; Edit details
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || sendingOtp}
                className="link-btn"
              >
                {resendTimer > 0 ? (
                  <>Resend in {resendTimer}s</>
                ) : (
                  <><RefreshCw size={12} /> Resend OTP</>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
        .auth-card { background: #fff; padding: 36px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); max-width: 480px; width: 100%; }
        .auth-card h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .auth-card > p { color: var(--color-text-light); margin-bottom: 24px; font-size: 14px; line-height: 1.5; }
        .hint { font-size: 11px; color: var(--color-text-light); margin-top: 4px; }
        .dev-hint {
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
          padding: 8px 12px;
          font-size: 12px;
          color: #b45309;
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .password-wrap { position: relative; }
        .password-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          padding: 6px; color: var(--color-text-light); background: transparent; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .password-toggle:hover { color: var(--color-accent); background: rgba(244, 51, 54, 0.08); }
        .channel-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        .channel-option {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .channel-option.selected {
          border-color: var(--color-accent);
          background: rgba(244, 51, 54, 0.04);
          box-shadow: 0 0 0 1px var(--color-accent);
        }
        .channel-option input { margin: 0; }
        .channel-option strong { display: block; font-size: 13px; }
        .channel-option p { font-size: 11px; color: var(--color-text-light); margin-top: 2px; }
        .otp-inputs {
          display: flex; gap: 10px;
          justify-content: center;
          margin: 24px 0;
        }
        .otp-box {
          width: 48px; height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          border: 2px solid var(--color-border);
          border-radius: 8px;
          outline: none;
          transition: border 0.15s;
        }
        .otp-box:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(244, 51, 54, 0.15);
        }
        .otp-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
          font-size: 13px;
        }
        .link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--color-accent);
          background: none;
          font-weight: 500;
        }
        .link-btn:hover { text-decoration: underline; }
        .link-btn:disabled { color: var(--color-text-light); cursor: not-allowed; }
        .auth-switch { text-align: center; margin-top: 16px; font-size: 13px; color: var(--color-text-light); }
        .auth-switch a { color: var(--color-accent); font-weight: 500; }
        @media (max-width: 480px) {
          .otp-box { width: 40px; height: 48px; font-size: 20px; }
          .otp-inputs { gap: 6px; }
        }
      `}</style>
    </div>
  );
}
