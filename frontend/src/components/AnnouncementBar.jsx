export default function AnnouncementBar() {
  const messages = [
    '30-Day Easy Returns',
    '24/7 Customer Support',
    'Free Shipping on orders above ₹999',
  ];
  return (
    <div className="announcement-bar">
      <div className="container announcement-track">
        {messages.map((m, i) => (
          <span key={i} className="announcement-item">
            {m}
          </span>
        ))}
      </div>
      <style>{`
        .announcement-bar {
          background: var(--color-accent);
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 0;
          overflow: hidden;
        }
        .announcement-track {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          text-align: center;
        }
        .announcement-item {
          letter-spacing: 0.3px;
        }
        @media (max-width: 600px) {
          .announcement-track { gap: 12px; font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
