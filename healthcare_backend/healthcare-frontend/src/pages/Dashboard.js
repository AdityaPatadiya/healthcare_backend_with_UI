import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Healthcare Dashboard</h1>
        <p>Welcome back, {user?.first_name} {user?.last_name}!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Patients</h3>
          <p>Manage patient records and information</p>
          <a href="/patients" className="stat-link">View Patients</a>
        </div>

        <div className="stat-card">
          <h3>Doctors</h3>
          <p>Manage doctor profiles and information</p>
          <a href="/doctors" className="stat-link">View Doctors</a>
        </div>

        <div className="stat-card">
          <h3>Mappings</h3>
          <p>Manage patient-doctor relationships</p>
          <a href="/mappings" className="stat-link">View Mappings</a>
        </div>
      </div>

      <div className="user-info">
        <h3>Your Information</h3>
        <div className="info-grid">
          <div><strong>Username:</strong> {user?.username}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Role:</strong> {user?.profile?.role}</div>
          <div><strong>Name:</strong> {user?.first_name} {user?.last_name}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
