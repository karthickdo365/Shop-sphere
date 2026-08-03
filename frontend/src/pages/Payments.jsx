import { CreditCard, Plus } from 'lucide-react';

export default function Payments() {
  return (
    <div className="container payments-page">
      <h1 className="page-title">
        <CreditCard size={22} /> Payment Methods
      </h1>

      <div className="empty-state">
        <CreditCard size={40} color="#ccc" />
        <p>No saved payment methods yet.</p>
        <button className="btn btn-primary btn-sm" disabled>
          <Plus size={16} /> Add Payment Method
        </button>
        <p className="coming-soon">Coming soon</p>
      </div>

      <style>{`
        .payments-page { padding: 24px 16px; max-width: 600px; }
        .page-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 24px; font-weight: 700; margin-bottom: 24px;
        }
        .empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 60px 20px;
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-md);
          text-align: center;
        }
        .empty-state p { color: var(--color-text-light); }
        .empty-state .btn { display: inline-flex; align-items: center; gap: 6px; opacity: 0.6; cursor: not-allowed; }
        .coming-soon { font-size: 12px; color: #aaa; margin-top: -4px; }
      `}</style>
    </div>
  );
}