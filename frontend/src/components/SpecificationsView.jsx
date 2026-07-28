/**
 * Reusable component that displays product specifications grouped by section.
 * Works for ANY product type (phone, toy, clothing, furniture, book, etc.)
 * because sections and keys are dynamic — read from the data, not hardcoded.
 *
 * @param {Array<{ section: string, key: string, value: string }>} specifications
 */
export default function SpecificationsView({ specifications, title = 'Specifications' }) {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  // Group specs by section, preserving first-seen order
  const grouped = {};
  const sectionOrder = [];
  specifications.forEach((s) => {
    const sec = s.section?.trim() || 'General';
    if (!grouped[sec]) {
      grouped[sec] = [];
      sectionOrder.push(sec);
    }
    grouped[sec].push(s);
  });

  return (
    <div className="specs-view">
      <h2 className="specs-view-title">{title}</h2>
      <div className="specs-view-grid">
        {sectionOrder.map((section) => (
          <div key={section} className="spec-section">
            <h3 className="spec-section-title">{section}</h3>
            <div className="spec-section-divider" />
            <table className="spec-table">
              <tbody>
                {grouped[section].map((spec) => (
                  <tr key={spec.id || `${section}-${spec.key}`}>
                    <td className="spec-key">{spec.key}</td>
                    <td className="spec-value">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <style>{`
        .specs-view {
          margin-top: 32px;
        }
        .specs-view-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--color-accent);
          display: inline-block;
        }
        .specs-view-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .spec-section {
          background: #fafafa;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 16px 18px;
        }
        .spec-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 6px;
        }
        .spec-section-divider {
          height: 2px;
          background: var(--color-accent);
          width: 36px;
          margin-bottom: 12px;
        }
        .spec-table {
          width: 100%;
          border-collapse: collapse;
        }
        .spec-table tr {
          border-bottom: 1px solid #ececec;
        }
        .spec-table tr:last-child {
          border-bottom: none;
        }
        .spec-table td {
          padding: 8px 0;
          font-size: 13px;
          vertical-align: top;
        }
        .spec-key {
          color: var(--color-text-light);
          width: 45%;
          font-weight: 500;
        }
        .spec-value {
          color: var(--color-text);
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .specs-view-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
