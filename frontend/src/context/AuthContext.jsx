import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ss_user');
    const token = localStorage.getItem('ss_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
      // Verify token still valid
      api.get('/auth/me')
        .then((r) => {
          setUser(r.data.data);
          localStorage.setItem('ss_user', JSON.stringify(r.data.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    const { user: u, token } = r.data.data;
    localStorage.setItem('ss_token', token);
    localStorage.setItem('ss_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const r = await api.post('/auth/register', data);
    const { user: u, token } = r.data.data;
    localStorage.setItem('ss_token', token);
    localStorage.setItem('ss_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
