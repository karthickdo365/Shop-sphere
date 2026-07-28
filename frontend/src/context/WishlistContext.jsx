import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist([]);
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const r = await api.get('/wishlist');
      setWishlist(r.data.data);
    } catch (e) {
      console.error('Failed to fetch wishlist', e);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) return { requiresAuth: true };
    const r = await api.post(`/wishlist/${productId}`);
    await fetchWishlist();
    return r.data.data;
  };

  const isInWishlist = (productId) =>
    wishlist.some((p) => p.id === productId);

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
