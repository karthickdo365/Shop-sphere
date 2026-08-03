import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api.js';

const emptyForm = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

export default function Addresses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = () => {
    setLoading(true);
    api
      .get('/auth/addresses')
      .then((r) => setAddresses(r.data.data || []))
      .catch(() => toast.error('Could not load addresses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openForm = () => {
    setForm(emptyForm);
    setShowForm(true);
    setSearchParams({ add: 'true' });
  };

  const closeForm = () => {
    setShowForm(false);
    setSearchParams({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      await api.post('/auth/addresses', form);
      toast.success('Address added');
      closeForm();
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container addresses-page">
      <div className="page-header">
        <h1 className="page-title">
          <MapPin size={22} /> My Addresses
        </h1>
        {!showForm && (
          <button className="btn btn-primary btn-sm" onClick={openForm}>
            <Plus size={16} /> Add New Address
          </button>
        )}
      </div>

      {showForm && (
        <div className="address-form-card">
          <div className="form-card-header">
            <h3>Add New Address</h3>
            <button className="close-btn" onClick={closeForm} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-row">
              <label>
                Full Name
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
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
                  required
                />
              </label>
            </div>

            <label>
              Address Line 1
              <input
                type="text"
                name="line1"
                value={form.line1}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Address Line 2 (optional)
              <input
                type="text"
                name="line2"
                value={form.line2}
                onChange={handleChange}
              />
            </label>

            <div className="form-row form-row-3">
              <label>
                City
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                State
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Pincode
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
              />
              Set as default address
            </label>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading addresses...</p>
      ) : addresses.length === 0 && !showForm ? (
        <div className="empty-state">
          <MapPin size={40} color="#ccc" />
          <p>No saved addresses yet.</p>
          <button className="btn btn-primary btn-sm" onClick={openForm}>
            <Plus size={16} /> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <div key={addr.id} className="address-card">
              {addr.isDefault && <span className="default-tag">Default</span>}
              <p className="address-name">{addr.fullName}</p>
              <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p>{addr.city}, {addr.state} - {addr.pincode}</p>
              <p>+91 {addr.phone}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .addresses-page { padding: 24px 16px; max-width: 800px; }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .page-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 700;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .address-form-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 20px;
          background: #fff;
          margin-bottom: 24px;
        }
        .form-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .address-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .form-row-3 {
          grid-template-columns: 1fr 1fr 1fr;
        }
        .address-form label {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          font-weight: 500;
          gap: 6px;
        }
        .address-form input[type="text"],
        .address-form input[type="tel"] {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
        }
        .checkbox-row {
          flex-direction: row !important;
          align-items: center;
          gap: 8px !important;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .loading-text {
          color: var(--color-text-light);
          padding: 40px 0;
          text-align: center;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 60px 0;
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-md);
        }
        .empty-state p { color: var(--color-text-light); margin-bottom: 6px; }

        .address-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .address-card {
          position: relative;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 16px;
          background: #fff;
          font-size: 13px;
          line-height: 1.6;
        }
        .address-name { font-weight: 600; margin-bottom: 2px; }
        .default-tag {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(244, 51, 54, 0.1);
          color: var(--color-accent);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        @media (max-width: 600px) {
          .form-row, .form-row-3 { grid-template-columns: 1fr; }
          .address-list { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}