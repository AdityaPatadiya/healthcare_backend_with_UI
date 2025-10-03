import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { getToken, removeToken, isAuthenticated } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const userData = await authService.getProfile();
    setUser(userData);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    const profile = await authService.getProfile();
    setUser(profile);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const updatedUser = await authService.updateProfile(userData);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
