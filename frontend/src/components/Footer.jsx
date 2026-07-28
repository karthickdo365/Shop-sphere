import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

export default function Footer() {
  const [email, setEmail] = useState('');

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-column brand-info">
          <div className="logo-container">
            <span className="logo-text">Shop<span className="logo-accent">Sphere</span></span>
          </div>
          <p>Elevate your style with our curated collection of men's and boys' fashion.</p>
        </div>

        <div className="footer-column">
          <h4>Policy</h4>
          <ul>
            <li><Link to="/policy/returns">Return And Exchange Policy</Link></li>
            <li><Link to="/policy/shipping">Shipping Policy</Link></li>
            <li><Link to="/policy/privacy">Privacy Policy</Link></li>
            <li><Link to="/policy/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Information</h4>
          <ul>
            <Link to="/about">About us</Link>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/orders">Track Order</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Join Our Newsletter</h4>
          <p>Get exclusive offers and style updates straight to your inbox.</p>
          <form className="newsletter-form" onSubmit={subscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
          </form>
          <div className="social-icons">
            <a href="https://www.facebook.com/ShopSpheres" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://www.instagram.com/shopsphere/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>

      <style>{`
        .footer {
          background: var(--color-dark);
          color: #fff;
          padding: 48px 0 0;
          margin-top: 60px;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
          gap: 32px;
          padding-bottom: 40px;
        }
        .footer-column h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #fff;
        }
        .footer-column ul li {
          margin-bottom: 10px;
        }
        .footer-column ul li a {
          color: #b8b8b8;
          font-size: 14px;
          transition: color 0.2s;
        }
        .footer-column ul li a:hover {
          color: var(--color-accent);
        }
        .brand-info .logo-text {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          display: inline-block;
          margin-bottom: 12px;
        }
        .brand-info .logo-accent { color: var(--color-accent); }
        .brand-info p {
          color: #b8b8b8;
          font-size: 14px;
          line-height: 1.7;
        }
        .footer-column > p {
          color: #b8b8b8;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .newsletter-form {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .newsletter-form input {
          flex: 1;
          padding: 10px 12px;
          background: #3a3a3a;
          border: 1px solid #4a4a4a;
          border-radius: 6px;
          color: #fff;
          font-size: 13px;
        }
        .newsletter-form input:focus {
          outline: none;
          border-color: var(--color-accent);
        }
        .social-icons {
          display: flex;
          gap: 12px;
        }
        .social-icons a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #3a3a3a;
          border-radius: 50%;
          color: #fff;
          transition: background 0.2s;
        }
        .social-icons a:hover {
          background: var(--color-accent);
        }
        .footer-bottom {
          border-top: 1px solid #3a3a3a;
          padding: 18px 0;
          text-align: center;
        }
        .footer-bottom p {
          color: #888;
          font-size: 13px;
        }
        @media (max-width: 768px) {
          .footer-content { grid-template-columns: 1fr 1fr; gap: 24px; }
        }
        @media (max-width: 480px) {
          .footer-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
