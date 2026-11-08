import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('selfcon_user') : null;
      return (saved && saved !== 'undefined' && saved !== 'null') ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('selfcon_token') || null : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('selfcon_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          localStorage.setItem('selfcon_user', JSON.stringify(res.data.user));
        } catch (err) {
          localStorage.removeItem('selfcon_token');
          localStorage.removeItem('selfcon_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('selfcon_token', newToken);
    localStorage.setItem('selfcon_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async userData => {
    const res = await authAPI.register(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('selfcon_token', newToken);
    localStorage.setItem('selfcon_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('selfcon_token');
    localStorage.removeItem('selfcon_user');
    setToken(null);
    setUser(null);
  };

  const switchRole = async newRole => {
    const res = await authAPI.switchRole(newRole);
    const { user: updatedUser, token: newToken } = res.data;
    if (newToken) {
      localStorage.setItem('selfcon_token', newToken);
      setToken(newToken);
    }
    localStorage.setItem('selfcon_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  const updateProfile = async data => {
    const res = await authAPI.updateDetails(data);
    const updatedUser = res.data.user;
    localStorage.setItem('selfcon_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'guest',
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchRole,
        updateProfile
      }}
    >
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

