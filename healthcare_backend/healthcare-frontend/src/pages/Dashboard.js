import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.profile?.role === 'admin';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Healthcare Dashboard</h1>
        <p>Welcome back, {user?.first_name} {user?.last_name}!</p>
        {isAdmin && (
          <div className="admin-welcome">
            <span className="admin-icon">⚡</span>
            You have administrator privileges
          </div>
        )}
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

        {/* Admin-only stats */}
        {isAdmin && (
          <>
            <div className="stat-card admin-card">
              <h3>User Management</h3>
              <p>Manage system users and permissions</p>
              <a href="/users" className="stat-link admin-link">Manage Users</a>
            </div>

            <div className="stat-card admin-card">
              <h3>System Reports</h3>
              <p>View system analytics and reports</p>
              <a href="/reports" className="stat-link admin-link">View Reports</a>
            </div>
          </>
        )}
      </div>

      <div className="user-info">
        <h3>Your Information</h3>
        <div className="info-grid">
          <div><strong>Username:</strong> {user?.username}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Role:</strong> 
            <span className={`role-badge ${user?.profile?.role}`}>
              {user?.profile?.role}
            </span>
          </div>
          <div><strong>Name:</strong> {user?.first_name} {user?.last_name}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
