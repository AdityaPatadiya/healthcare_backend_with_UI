import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Placeholder.css';

const Users = () => {
  const { user } = useAuth();

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
              <div><strong>Username:</strong> {user?.username}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Role:</strong> <span className="role-badge admin">{user?.profile?.role}</span></div>
              <div><strong>Name:</strong> {user?.first_name} {user?.last_name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
