import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import PatientList from './components/patients/PatientList';
import DoctorList from './components/doctors/DoctorList';
import MappingList from './components/mappings/MappingList';
import Users from './pages/Users';
import Reports from './pages/Reports';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/patients" element={
          <ProtectedRoute>
            <Navbar />
            <PatientList />
          </ProtectedRoute>
        } />
        
        <Route path="/doctors" element={
          <ProtectedRoute>
            <Navbar />
            <DoctorList />
          </ProtectedRoute>
        } />
        
        <Route path="/mappings" element={
          <ProtectedRoute>
            <Navbar />
            <MappingList />
          </ProtectedRoute>
        } />

        {/* Admin-only routes */}
        <Route path="/users" element={
          <AdminProtectedRoute>
            <Navbar />
            <Users />
          </AdminProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <AdminProtectedRoute>
            <Navbar />
            <Reports />
          </AdminProtectedRoute>
        } />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
