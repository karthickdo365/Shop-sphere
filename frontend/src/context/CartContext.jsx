import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load cart whenever user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const r = await api.get('/cart');
      setCart(r.data.data);
    } catch (e) {
      console.error('Failed to fetch cart', e);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async ({ productId, size, color, quantity = 1, variantId }) => {
    if (!user) {
      return { requiresAuth: true };
    }
    const r = await api.post('/cart/items', { productId, size, color, quantity, variantId });
    await fetchCart();
    return r.data;
  };

  const updateItem = async (id, quantity) => {
    await api.put(`/cart/items/${id}`, { quantity });
    await fetchCart();
  };

  const removeItem = async (id) => {
    await api.delete(`/cart/items/${id}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart');
    await fetchCart();
  };

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartSubtotal = cart?.items?.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartSubtotal,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
