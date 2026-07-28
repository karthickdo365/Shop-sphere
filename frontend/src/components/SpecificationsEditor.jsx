import { Plus, Trash2 } from 'lucide-react';

/**
 * Reusable admin editor for product specifications.
 * Allows unlimited specs grouped by section, with add/edit/remove.
 *
 * @param {Array<{ id?, section, key, value }>} specs
 * @param {(specs) => void} onChange
 */
export default function SpecificationsEditor({ specs = [], onChange }) {
  const addSpec = () => {
    onChange([
      ...specs,
      { section: 'General', key: '', value: '', _tempId: Date.now() + Math.random() },
    ]);
  };

  const updateSpec = (idx, field, value) => {
    onChange(specs.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const removeSpec = (idx) => {
    onChange(specs.filter((_, i) => i !== idx));
  };

  // Group for display
  const grouped = {};
  const sectionOrder = [];
  specs.forEach((s) => {
    const sec = s.section?.trim() || 'General';
    if (!grouped[sec]) {
      grouped[sec] = [];
      sectionOrder.push(sec);
    }
    grouped[sec].push(s);
  });

  return (
    <div className="specs-editor">
      <div className="specs-editor-header">
        <label className="form-label">Specifications</label>
        <button type="button" className="btn btn-outline btn-sm" onClick={addSpec}>
          <Plus size={14} /> Add Specification
        </button>
      </div>
      <p className="specs-help">
        Add specifications grouped by section (e.g. Display, Performance, Battery, General, Material).
        Works for any product type — phones, toys, clothes, laptops, furniture, books, etc.
      </p>

      {specs.length === 0 ? (
        <div className="specs-empty">
          No specifications yet. Click "Add Specification" to create one.
        </div>
      ) : (
        <div className="specs-list">
          {specs.map((spec, idx) => (
            <div key={spec.id || spec._tempId || idx} className="spec-row">
              <input
                type="text"
                className="form-input spec-section-input"
                placeholder="Section (e.g. Display)"
                value={spec.section}
                onChange={(e) => updateSpec(idx, 'section', e.target.value)}
                list="spec-sections"
              />
              <input
                type="text"
                className="form-input spec-key-input"
                placeholder="Key (e.g. Size)"
                value={spec.key}
                onChange={(e) => updateSpec(idx, 'key', e.target.value)}
              />
              <input
                type="text"
                className="form-input spec-value-input"
                placeholder="Value (e.g. 6.7 inch)"
                value={spec.value}
                onChange={(e) => updateSpec(idx, 'value', e.target.value)}
              />
              <button
                type="button"
                className="icon-action delete"
                onClick={() => removeSpec(idx)}
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Datalist of existing sections for autocomplete */}
      <datalist id="spec-sections">
        {sectionOrder.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {/* Preview */}
      {specs.length > 0 && (
        <div className="specs-preview">
          <p className="preview-title">Preview:</p>
          {sectionOrder.map((section) => (
            <div key={section} className="preview-section">
              <p className="preview-section-title">{section}</p>
              <ul>
                {grouped[section].map((s, i) => (
                  <li key={i}>
                    <strong>{s.key || '...'}</strong>: {s.value || '...'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .specs-editor {
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 16px;
          background: #fafafa;
        }
        .specs-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .specs-editor-header .form-label {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
        .specs-help {
          font-size: 12px;
          color: var(--color-text-light);
          margin-bottom: 14px;
          line-height: 1.5;
        }
        .specs-empty {
          padding: 20px;
          text-align: center;
          color: var(--color-text-light);
          font-size: 13px;
          background: #fff;
          border-radius: 6px;
          border: 1px dashed var(--color-border);
        }
        .specs-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .spec-row {
          display: grid;
          grid-template-columns: 160px 160px 1fr 32px;
          gap: 8px;
          align-items: center;
        }
        .spec-row .form-input {
          padding: 8px 10px;
          font-size: 13px;
        }
        .icon-action {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid var(--color-border);
          color: var(--color-text);
          transition: all 0.2s;
        }
        .icon-action.delete:hover {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }
        .specs-preview {
          margin-top: 14px;
          padding: 12px;
          background: #fff;
          border-radius: 6px;
          border: 1px solid var(--color-border);
        }
        .preview-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-light);
          margin-bottom: 8px;
        }
        .preview-section {
          margin-bottom: 10px;
        }
        .preview-section:last-child { margin-bottom: 0; }
        .preview-section-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-accent);
          margin-bottom: 4px;
        }
        .preview-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 12px;
        }
        .preview-section li {
          padding: 2px 0;
          color: var(--color-text-light);
        }
        @media (max-width: 600px) {
          .spec-row { grid-template-columns: 1fr 1fr; }
          .spec-row .icon-action { grid-column: 2; justify-self: end; }
        }
      `}</style>
    </div>
  );
}
