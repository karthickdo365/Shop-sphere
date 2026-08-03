import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return; // extra guard against double-submit (e.g. double-click, Enter + click)

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        ...form,
        email: form.email.trim().toLowerCase(),
      });

      toast.success(
        res.data.message ||
        "Verification email sent. Please check your inbox."
      );

      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>

        <p className="auth-desc">
          Create your ShopSphere account.
        </p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              required
              className="form-input"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              name="email"
              required
              className="form-input"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>

            <div className="password-wrap">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                required
                minLength={6}
                className="form-input"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{
                  paddingRight: "45px",
                }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>

      <style>{`
        .auth-page{
          min-height:70vh;
          display:flex;
          justify-content:center;
          align-items:center;
          padding:40px 16px;
        }

        .auth-card{
          background:#fff;
          padding:36px;
          width:100%;
          max-width:450px;
          border-radius:12px;
          box-shadow:0 8px 25px rgba(0,0,0,.08);
        }

        .auth-card h1{
          margin-bottom:10px;
        }

        .auth-desc{
          color:#777;
          margin-bottom:25px;
        }

        .form-group{
          margin-bottom:18px;
        }

        .form-label{
          display:block;
          margin-bottom:8px;
          font-weight:600;
        }

        .form-input{
          width:100%;
        }

        .password-wrap{
          position:relative;
        }

        .password-toggle{
          position:absolute;
          right:10px;
          top:50%;
          transform:translateY(-50%);
          background:none;
          border:none;
          cursor:pointer;
        }

        .auth-switch{
          text-align:center;
          margin-top:20px;
        }
      `}</style>
    </div>
  );
}