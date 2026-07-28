import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductGrid from '../components/ProductGrid.jsx';

export default function Wishlist() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();

  if (!user) {
    return (
      <div className="container empty-wishlist">
        <h1>Please login to view your wishlist</h1>
        <Link to="/login" className="btn btn-primary">Login</Link>
        <style>{`.empty-wishlist { text-align: center; padding: 60px 20px; } .empty-wishlist h1 { font-size: 22px; margin-bottom: 16px; }`}</style>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container empty-wishlist">
        <Heart size={64} color="#ccc" />
        <h1>Your wishlist is empty</h1>
        <p>Save your favorite products here for later.</p>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
        <style>{`
          .empty-wishlist {
            text-align: center;
            padding: 60px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          .empty-wishlist h1 { font-size: 22px; margin: 12px 0 4px; }
          .empty-wishlist p { color: var(--color-text-light); margin-bottom: 12px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container wishlist-page">
      <h1 className="page-title">My Wishlist ({wishlist.length})</h1>
      <ProductGrid products={wishlist} loading={false} />
      <style>{`
        .wishlist-page { padding: 24px 16px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
      `}</style>
    </div>
  );
}
