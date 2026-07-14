/* AuthContext - Session & Login Management for Admin Dashboard */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('ziv_admin_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ziv_admin_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    // Fallback if token exists but user isn't cached yet
    if (localStorage.getItem('ziv_admin_token')) {
      return { id: 'admin-0', name: 'Ziv Admin', email: 'admin@zivfoundation.org', role: 'SuperAdmin' };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate session on start quietly in the background
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await api.auth.getCurrentUser();
          setUser(userData);
          localStorage.setItem('ziv_admin_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Session verification failed. Logging out.", err);
          logout();
        }
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem('ziv_admin_token', data.token);
      localStorage.setItem('ziv_admin_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('ziv_admin_token');
    localStorage.removeItem('ziv_admin_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
