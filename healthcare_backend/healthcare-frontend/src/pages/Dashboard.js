import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const userRole = user?.profile?.role || user?.role || user?.user?.role || 'user';
  const isAdmin = userRole === 'admin';

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.profile?.first_name && user?.profile?.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`;
    }
    if (user?.name) {
      return user.name;
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get specific user properties safely
  const username = user?.username || user?.user?.username || 'N/A';
  const email = user?.email || user?.user?.email || 'N/A';
  const fullName = getUserDisplayName();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Healthcare Dashboard</h1>
        <p className="welcome-message">Welcome back, {fullName}!</p>
        {isAdmin && (
          <div className="admin-welcome">
            <span className="admin-icon">⚡</span>
            You have administrator privileges
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-content">
            <h3 className="card-title">Patients</h3>
            <p className="card-description">Manage patient records and information</p>
          </div>
          <Link to="/patients" className="card-button">View Patients</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-content">
            <h3 className="card-title">Doctors</h3>
            <p className="card-description">Manage doctor profiles and information</p>
          </div>
          <Link to="/doctors" className="card-button">View Doctors</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-content">
            <h3 className="card-title">Mappings</h3>
            <p className="card-description">Manage patient-doctor relationships</p>
          </div>
          <Link to="/mappings" className="card-button">View Mappings</Link>
        </div>

        {/* Admin-only cards */}
        {isAdmin && (
          <>
            <div className="dashboard-card">
              <div className="card-content">
                <h3 className="card-title">Management</h3>
                <p className="card-description">Manage system users and permissions</p>
              </div>
              <Link to="/users" className="card-button">Manual Uses</Link>
            </div>

            <div className="dashboard-card">
              <div className="card-content">
                <h3 className="card-title">System Reports</h3>
                <p className="card-description">View system analytics and reports</p>
              </div>
              <Link to="/reports" className="card-button">View Reports</Link>
            </div>

            <div className="dashboard-card">
              <div className="card-content">
                <h3 className="card-title">Settings</h3>
                <p className="card-description">Configure system settings and preferences</p>
              </div>
              <Link to="/settings" className="card-button">Open Settings</Link>
            </div>
          </>
        )}
      </div>

      <hr className="divider" />

      <div className="user-info-section">
        <h3 className="user-info-title">User Information</h3>
        <div className="user-info-grid">
          <div className="info-item">
            <strong>Username:</strong> {username}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {email}
          </div>
          <div className="info-item">
            <strong>Role:</strong>
            <span className={`role-badge ${userRole}`}>
              {userRole}
            </span>
          </div>
          <div className="info-item">
            <strong>Name:</strong> {fullName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
