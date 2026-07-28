import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
      <style>{`
        .not-found {
          text-align: center;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .not-found h1 {
          font-size: 96px;
          font-weight: 800;
          color: var(--color-accent);
          line-height: 1;
        }
        .not-found h2 { font-size: 24px; font-weight: 600; }
        .not-found p { color: var(--color-text-light); }
      `}</style>
    </div>
  );
}
