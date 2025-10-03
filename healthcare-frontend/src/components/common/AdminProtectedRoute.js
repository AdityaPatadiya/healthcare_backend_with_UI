import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check for admin role in multiple possible locations
  const isAdmin = 
    user?.profile?.role === 'admin' || 
    user?.role === 'admin' ||
    user?.user?.role === 'admin';

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminProtectedRoute;
