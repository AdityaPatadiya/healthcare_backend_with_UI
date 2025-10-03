import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Placeholder.css';

const Users = () => {
  const { user } = useAuth();

  // Safely get user data (same method as Dashboard.js)
  const userRole = user?.profile?.role || user?.role || user?.user?.role || 'user';
  const username = user?.username || user?.user?.username || 'N/A';
  const email = user?.email || user?.user?.email || 'N/A';
  
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
    return 'N/A';
  };

  const fullName = getUserDisplayName();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system users and their permissions</p>
      </div>

      <div className="placeholder-container">
        <div className="placeholder-content">
          <div className="placeholder-icon">👥</div>
          <h2>User Management</h2>
          <p>This feature is coming soon!</p>
          <p>Here you'll be able to manage all system users, assign roles, and control permissions.</p>
          <div className="user-info-card">
            <h3>Current User Information</h3>
            <div className="info-grid">
              <div><strong>Username:</strong> {username}</div>
              <div><strong>Email:</strong> {email}</div>
              <div><strong>Role:</strong> <span className="role-badge admin">{userRole}</span></div>
              <div><strong>Name:</strong> {fullName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
