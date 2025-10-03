import React from 'react';
import { Link } from 'react-router-dom'; // Add this import
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  // Try multiple possible locations for role and user data
  const userRole = user?.profile?.role || user?.role || user?.user?.role || 'user';
  const isAdmin = userRole === 'admin';

  // Get user's display name from various possible locations
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
      return user.email.split('@')[0]; // Return part before @ in email
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
        <p>Welcome back, {fullName}!</p>
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
          <Link to="/patients" className="stat-link">View Patients</Link> {/* Changed to Link */}
        </div>

        <div className="stat-card">
          <h3>Doctors</h3>
          <p>Manage doctor profiles and information</p>
          <Link to="/doctors" className="stat-link">View Doctors</Link> {/* Changed to Link */}
        </div>

        <div className="stat-card">
          <h3>Mappings</h3>
          <p>Manage patient-doctor relationships</p>
          <Link to="/mappings" className="stat-link">View Mappings</Link> {/* Changed to Link */}
        </div>

        {/* Admin-only stats */}
        {isAdmin && (
          <>
            <div className="stat-card"> {/* Remove admin-card class */}
              <h3>User Management</h3>
              <p>Manage system users and permissions</p>
              <Link to="/users" className="stat-link">Manage Users</Link> {/* Remove admin-link class */}
            </div>

            <div className="stat-card"> {/* Remove admin-card class */}
              <h3>System Reports</h3>
              <p>View system analytics and reports</p>
              <Link to="/reports" className="stat-link">View Reports</Link> {/* Remove admin-link class */}
            </div>
          </>
        )}
      </div>

      <div className="user-info">
        <h3>Your Information</h3>
        <div className="info-grid">
          <div><strong>Username:</strong> {username}</div>
          <div><strong>Email:</strong> {email}</div>
          <div><strong>Role:</strong>
            <span className={`role-badge ${userRole}`}>
              {userRole}
            </span>
          </div>
          <div><strong>Name:</strong> {fullName}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
