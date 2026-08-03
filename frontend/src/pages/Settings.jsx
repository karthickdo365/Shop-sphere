import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  });

  const toggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preference updated');
    // Note: not persisted to backend yet — resets on reload.
  };

  return (
    <div className="container settings-page">
      <h1 className="page-title">
        <SettingsIcon size={22} /> Settings
      </h1>

      <div className="settings-card">
        <h3>Notifications</h3>

        <div className="setting-row">
          <div>
            <p className="setting-label">Order Updates</p>
            <p className="setting-desc">Get notified about order status changes</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={prefs.orderUpdates}
              onChange={() => toggle('orderUpdates')}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="setting-row">
          <div>
            <p className="setting-label">Promotions & Offers</p>
            <p className="setting-desc">Receive deals and discount alerts</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={prefs.promotions}
              onChange={() => toggle('promotions')}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="setting-row">
          <div>
            <p className="setting-label">Newsletter</p>
            <p className="setting-desc">Weekly style updates via email</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={prefs.newsletter}
              onChange={() => toggle('newsletter')}
            />
            <span className="slider" />
          </label>
        </div>

        <p className="persist-note">
          Preferences aren't saved to your account yet — this is a preview.
        </p>
      </div>

      <style>{`
        .settings-page { padding: 24px 16px; max-width: 600px; }
        .page-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 24px; font-weight: 700; margin-bottom: 24px;
        }
        .settings-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 24px;
          background: #fff;
        }
        .settings-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .setting-row:last-of-type { border-bottom: none; }
        .setting-label { font-size: 14px; font-weight: 500; }
        .setting-desc { font-size: 12px; color: var(--color-text-light); margin-top: 2px; }

        .switch {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 24px;
          flex-shrink: 0;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: 0.2s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background-color: #fff;
          transition: 0.2s;
          border-radius: 50%;
        }
        .switch input:checked + .slider { background-color: var(--color-accent); }
        .switch input:checked + .slider:before { transform: translateX(18px); }

        .persist-note {
          margin-top: 16px;
          font-size: 12px;
          color: var(--color-text-light);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}