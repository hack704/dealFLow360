import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dealflow_token');
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          if (res && res.data) {
            setUser(res.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Existing session invalid:', err.message);
          localStorage.removeItem('dealflow_token');
          localStorage.removeItem('dealflow_user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    sessionStorage.removeItem('dealflow_logged_out');
    const res = await authService.login(email, password);
    if (res && res.data) {
      setUser(res.data);
    }
    return res;
  };

  const register = async (userData) => {
    sessionStorage.removeItem('dealflow_logged_out');
    const res = await authService.register(userData);
    if (res && res.data) {
      setUser(res.data);
    }
    return res;
  };

  const loginWithMagicLink = async (email, quotationNumber) => {
    sessionStorage.removeItem('dealflow_logged_out');
    const res = await authService.loginWithMagicLink(email, quotationNumber);
    if (res && res.data) {
      setUser(res.data);
    }
    return res;
  };

  const logout = () => {
    sessionStorage.setItem('dealflow_logged_out', 'true');
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithMagicLink, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
