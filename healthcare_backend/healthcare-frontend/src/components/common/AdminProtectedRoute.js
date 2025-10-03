import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if user is authenticated and is an admin
  if (!user || user.profile?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminProtectedRoute;
